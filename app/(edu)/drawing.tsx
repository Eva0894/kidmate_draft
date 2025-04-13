import React, { useRef } from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity, Alert } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const DrawingPage = () => {
  const ref = useRef<any>();
  const router = useRouter();

  const handleOK = async (signature: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限拒绝', '无法保存图片到相册');
        return;
      }

      const base64Data = signature.replace('data:image/png;base64,', '');
      const fileUri = FileSystem.cacheDirectory + 'drawing.png';

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('MyDrawings');

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync('MyDrawings', asset, false);
      }


      Alert.alert('✅ Saving Successfully', 'Your Work is Saved in Photos! (MyDrawings)');
    } catch (err) {
      console.error('Save Failed:', err);
      Alert.alert('❌ Save Failed', 'Please Try Again');
    }
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleUndo = () => {
    ref.current?.undo();
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.seeMyWorkButton}
            onPress={() => {
                console.log('jump to ViewDrawings');
                router.push('/viewdrawings')
              }}
        >
            <Text style={styles.seeMyWorkText}>🖼 See My Work</Text>
        </TouchableOpacity>
        </View>

        

      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        autoClear={false}
        webStyle={style}
      />

      <View style={styles.buttonContainer}>
        <Button title="Save" color="#e2ac30" onPress={() => ref.current.readSignature()} />
        <Button title="Clear" color="#e2ac30" onPress={handleClear} />
        <Button title="Revoke" color="#e2ac30" onPress={handleUndo} />
      </View>
    </View>
  );
};

const style = `.m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: 2px solid #e2ac30; }
  .m-signature-pad--footer { display: none; margin: 0px; }
  body,html { width: 100%; height: 100%; margin: 0; padding: 0; }`;

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  viewButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
  seeMyWorkButton: {
    padding: 8,
  },
  seeMyWorkText: {
    fontSize: 16,
    color: '#6a5acd',
    fontWeight: 'bold',
  },
  
  
});

export default DrawingPage;
