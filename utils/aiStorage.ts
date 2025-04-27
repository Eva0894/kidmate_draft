// // utils/aiStorage.ts
// import { db } from './localDB';
// import { supabase } from './Supabase';
// import * as SQLite from 'expo-sqlite';


// export const saveMessageLocally = (userId: string, role: string, content: string) => {
//   const timestamp = Date.now();
//   db.transaction(tx => {
//     tx.executeSql(
//       'INSERT INTO ai_messages (user_id, role, content, timestamp, uploaded) VALUES (?, ?, ?, ?, 0)',
//       [userId, role, content, timestamp]
//     );
//   });
// };

// export const getLocalMessages = (userId: string, callback: (results: any[]) => void) => {
//     db.transaction((tx: SQLite.SQLTransaction) => {
//     tx.executeSql(
//       'SELECT * FROM ai_messages WHERE user_id = ? ORDER BY timestamp ASC',
//       [userId],
//       (_, { rows }) => callback(rows._array)
//     );
//   });
// };

// export const syncMessagesToSupabase = async (userId: string) => {
//   db.transaction(tx => {
//     tx.executeSql(
//       'SELECT * FROM ai_messages WHERE uploaded = 0 AND user_id = ?',
//       [userId],
//       async (_, { rows }) => {
//         const messagesToUpload = rows._array;
//         for (const msg of messagesToUpload) {
//           const { error } = await supabase.from('ai_messages').insert({
//             user_id: msg.user_id,
//             role: msg.role,
//             content: msg.content,
//             timestamp: msg.timestamp,
//           });

//           if (!error) {
//             db.transaction(tx2 => {
//               tx2.executeSql('UPDATE ai_messages SET uploaded = 1 WHERE id = ?', [msg.id]);
//             });
//           }
//         }
//       }
//     );
//   });
// };
