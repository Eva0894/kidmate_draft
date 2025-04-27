import { View, Text, StyleSheet, Image } from 'react-native';
import { Message } from '@/utils/Interfaces';

const ChatMessage = ({ content, role, image }: Message) => {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.alignRight : styles.alignLeft]}>
      {/* AI 头像：左侧显示 */}
      {!isUser && (
        <Image
          source={require('@/assets/images/duck_head.png')}
          style={styles.avatar}
        />
      )}

      {/* 消息气泡 */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
            {content}
          </Text>
        )}
      </View>

      {/* 用户头像：右侧显示 */}
      {isUser && (
        <Image
          source={{ uri: 'https://galaxies.dev/img/meerkat_2.jpg' }}
          style={styles.avatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 6,
    marginTop: 5, 
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  bubble: {
    maxWidth: '70%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007aff',
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#e5e5ea',
    borderTopLeftRadius: 0,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
});

export default ChatMessage;
