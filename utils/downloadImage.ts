import * as FileSystem from 'expo-file-system';

export async function downloadImage(imageUrl: string, fileName: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}generated/`;
  const localUri = `${dir}${fileName}.png`;

  // 创建目录（如果还不存在）
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const downloadResumable = FileSystem.createDownloadResumable(imageUrl, localUri);

  try {
    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) throw new Error('Download failed or no URI returned.');

    console.log('✅ Image saved to:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Image download failed:', error);
    throw error;
  }
}
