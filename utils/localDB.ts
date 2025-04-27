// import SQLite from 'expo-sqlite';
// const db = SQLite?.default?.openDatabase?.('chat.db');

// export const initLocalDB = () => {
//   db.transaction(tx => {
//     tx.executeSql(
//       `CREATE TABLE IF NOT EXISTS ai_messages (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         user_id TEXT,
//         role TEXT,           -- 'user' or 'assistant'
//         content TEXT,
//         timestamp INTEGER,
//         uploaded INTEGER     -- 0 = 未上传，1 = 已上传
//       );`
//     );
//   });
// };
