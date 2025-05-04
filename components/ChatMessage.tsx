import { View, Text, StyleSheet, Image } from 'react-native';
import { Message } from '@/utils/Interfaces';

const ChatMessage = ({ content, role, image }: Message) => {
  const isUser = role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.alignRight : styles.alignLeft]}>
      {!isUser && (
        <Image
          source={require('@/assets/images/duck_head.png')}
          style={styles.avatar}
        />
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
            {content}
          </Text>
        )}
      </View>

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

  // ✅ 用户：奶油白气泡 + 棕色字体 + 左上角方形
  userBubble: {
    backgroundColor: '#fffbea',
    borderTopRightRadius: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  // ✅ AI：鸭蛋黄气泡 + 黑灰字体 + 右上角方形
  botBubble: {
    backgroundColor: '#fff0b3',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#4a3e2c',
  },
  botText: {
    color: '#333',
  },
  previewImage: {
    width: 240,
    height: 240,
    borderRadius: 10,
  },
});

export default ChatMessage;
