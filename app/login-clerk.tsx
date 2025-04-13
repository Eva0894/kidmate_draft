// import Colors from '@/constants/Colors';
// import { defaultStyles } from '@/constants/Styles';
// import { useSignIn } from '@clerk/clerk-expo';
// import { useLocalSearchParams } from 'expo-router';
// import React, { useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   TextInput,
//   Text,
//   Alert,
//   ActivityIndicator,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Image,
//   Platform,
// } from 'react-native';

// const Login = () => {
//   const { type } = useLocalSearchParams<{ type: string }>();
//   const { signIn, setActive, isLoaded } = useSignIn();

//   const [emailAddress, setEmailAddress] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const onSignInPress = async () => {
//     if (!isLoaded) {
//       return;
//     }
//     setLoading(true);
//     try {
//       const completeSignIn = await signIn.create({
//         identifier: emailAddress,
//         password,
//       });

//       await setActive({ session: completeSignIn.createdSessionId });
//     } catch (err: any) {
//       Alert.alert(err.errors[0].message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={70}
//       style={styles.container}>
//       {loading && (
//         <View style={defaultStyles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#fff" />
//         </View>
//       )}

//       <Image source={require('../assets/images/logo-dark.png')} style={styles.logo} />
//       <Text style={styles.title}>Welcome back</Text>
//       <View style={{ marginBottom: 30 }}>
//         <TextInput
//           autoCapitalize="none"
//           placeholder="john@apple.com"
//           value={emailAddress}
//           onChangeText={setEmailAddress}
//           style={styles.inputField}
//         />
//         <TextInput
//           placeholder="password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           style={styles.inputField}
//         />
//       </View>

//       <TouchableOpacity style={[defaultStyles.btn, styles.btnPrimary]} onPress={onSignInPress}>
//         <Text style={styles.btnPrimaryText}>Login</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   logo: {
//     width: 60,
//     height: 60,
//     alignSelf: 'center',
//     marginVertical: 80,
//   },
//   title: {
//     fontSize: 30,
//     marginBottom: 20,
//     fontWeight: 'bold',
//     alignSelf: 'center',
//   },
//   inputField: {
//     marginVertical: 4,
//     height: 50,
//     borderWidth: 1,
//     borderColor: Colors.primary,
//     borderRadius: 12,
//     padding: 10,
//     backgroundColor: '#fff',
//   },
//   btnPrimary: {
//     backgroundColor: Colors.primary,
//     marginVertical: 4,
//   },
//   btnPrimaryText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default Login;
