/*import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FlappyBirdPage() {*/
    /*
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://flappybird.io/' }}
        style={{ flex: 1 }}
        allowsFullscreenVideo
        startInLoadingState
      />
    </View>
  );*/
  /*const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
     
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>


      <WebView
        source={{ uri: 'https://flappybird.io/' }}
        style={{ flex: 1 }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
      },
      backText: {
        color: '#fff',
        marginLeft: 6,
        fontWeight: 'bold',
      },
  container: {
    flex: 1,
  },
});
*/

// app/(games)/flappy.tsx


import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function FlappyGamePage() {
  const router = useRouter();
  const [showTip, setShowTip] = useState(true);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>

     {/* 返回按钮 */}
               <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#E5911B" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>


      
      <WebView
        source={{ uri: 'https://flappybird.io/' }}
        style={styles.webview}
        allowsFullscreenVideo
        setSupportZoom={false}
        javaScriptEnabled
      />

     
      <Modal visible={showTip} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Click the screen carefully to make the little bird fly！</Text>
            <TouchableOpacity onPress={() => setShowTip(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>begin!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

 
      <Modal visible={showExitPrompt} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Do you want to play any other games？</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setShowExitPrompt(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff4e6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        zIndex: 1,
      },
      backText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#E5911B',
        fontWeight: 'bold',
      },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7e6',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D38300',
  },
  webview: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#D38300',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

