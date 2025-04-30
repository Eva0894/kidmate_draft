import HeaderDropDown from '@/components/HeaderDropDown';
import { defaultStyles } from '@/constants/Styles';
import {View, Image,Text, Button, StyleSheet,KeyboardAvoidingView, Platform} from 'react-native';
import {Redirect, Stack} from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import MessageInput from '@/components/MessageInput';
import { ScrollView } from 'react-native-gesture-handler';
import MessageIdeas from '@/components/MessageIdeas';
import { Message, Role } from '@/utils/Interfaces';
import { FlashList } from '@shopify/flash-list';
import ChatMessage from '@/components/ChatMessage';
import { useMMKVString } from 'react-native-mmkv';
import { keyStorage, storage } from '@/utils/Storage';
import OpenAI from 'react-native-openai';


const DUMMY_MESSAGES: Message[] = [
  {
    content: 'Hello! How can I help you today?',
    role: Role.Bot,
  },
  {
    content: 'I need help with my React Native app I need help with my React Native app I need help with my React Native app.',
    role: Role.User,
  },
  {
    content: 'Hello! How can I help you today?',
    role: Role.Bot,
  },
  {
    content: 'I need help with my React Native app I need help with my React Native app I need help with my React Native app.',
    role: Role.User,
  },
];
   
const Page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [height, setHeight] = useState(0);


    const [key, setKey] = useMMKVString('apikey', keyStorage);
    const [organization, setOrganization] = useMMKVString('org', keyStorage);
    const [gptVersion, setGptVersion] = useMMKVString('gptVersion', storage);

  if (!key || key === '' || !organization || organization === '') {
    return <Redirect href={'/(auth)/(modal)/settings'} />;
  }
  
  const openAI = useMemo(
    () =>
      new OpenAI({
        apiKey: key,
        organization,
      }),
    []
  );
    const getCompletion = async (message: string) => {
      console.log('Getting completion for:', message);
      if (messages.length === 0) {
      //   addChat(db, text).then((res) => {
      //     const chatID = res.lastInsertRowId;
      //     setChatId(chatID.toString());
      //     addMessage(db, chatID, { content: text, role: Role.User });
      //   });
      }
  
      setMessages([...messages, { role: Role.User, content: message }, { role: Role.Bot, content: '' }]);
      // messages.push();
      openAI.chat.stream({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        model: gptVersion == '4' ? 'gpt-4' : 'gpt-3.5-turbo',
      });
    };

    useEffect(() => {
      const handleNewMessage = (payload: any) => {
        console.log('New message received:', payload);
        setMessages((messages) => {

          const newMessage = payload.choices[0]?.delta.content;
          if (newMessage) {
            messages[messages.length - 1].content += newMessage;
            return [...messages];
          }
          if (payload.choices[0]?.finishReason) {
            // save the last message
  
            // addMessage(db, parseInt(chatIdRef.current), {
            //   content: messages[messages.length - 1].content,
            //   role: Role.Bot,
            // });
            console.log("Stream ended");
          }
          return messages;

        });
      };
  
      openAI.chat.addListener('onChatMessageReceived', handleNewMessage);
  
      return () => {
        openAI.chat.removeListener('onChatMessageReceived');
      };
    }, [openAI]);


    const onGptVersionChange = (version: string) => {
      setGptVersion(version);
    };


    const onLayout = (event: any) => {
      const { height } = event.nativeEvent.layout;
      setHeight(height / 2);
    };

    return (
      <View style={defaultStyles.pageContainer}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <HeaderDropDown
                title="KidMate"
                items={[
                  { key: '3.5', title: 'GPT-3.5', icon: 'bolt' },
                  { key: '4', title: 'GPT-4', icon: 'sparkles' },
                ]}
                onSelect={onGptVersionChange}
                selected={gptVersion}
              />
            ),
          }}
        />
        <View style={styles.page} onLayout={onLayout}>
          {messages.length == 0 && (
            <View style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}>
              <Image source={require('@/assets/images/logo-white.png')} style={styles.image} />
            </View>
          )}
          <FlashList
            data={messages}
            renderItem={({ item }) => <ChatMessage {...item} />}
            estimatedItemSize={400}
            contentContainerStyle={{ paddingTop: 30, paddingBottom: 150 }}
            keyboardDismissMode="on-drag"
          />
        </View>
  
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={70}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
          }}>
          {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
          <MessageInput onShouldSend={getCompletion} />
        </KeyboardAvoidingView>
      </View>
    );
  };


const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
  },
  page: {
    flex: 1,
  },
});

export default Page;