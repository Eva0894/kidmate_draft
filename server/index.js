import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import qs from 'qs';
import sendResetEmailHandler from './send-reset-email.js';
import fs from 'fs';

dotenv.config(); 

const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Server is running! You reached the backend.');
});

// ✅ 请求日志
app.use((req, res, next) => {
  console.log('📩 收到请求:', req.method, req.url);
  next();
});

// 登录接口（验证 hCaptcha）
app.post('/api/login', async (req, res) => {
  console.log('📩 收到 /api/login 请求');
  console.log('📦 请求内容:', req.body);
  const { token } = req.body;

  console.log('🔍 前端传入的 token:', token);
  console.log('🔍 从 .env 中读取的 HCAPTCHA_SECRET_KEY:', process.env.HCAPTCHA_SECRET_KEY);

  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing hCaptcha token' });
  }

  try {

    const { data } = await axios.post('https://hcaptcha.com/siteverify',
      qs.stringify({
        secret: process.env.HCAPTCHA_SECRET_KEY,
        response: token
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('🧠 hCaptcha 验证结果:', data);

    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: 'hCaptcha verification failed',
        errors: data['error-codes'],
      });
    }

    return res.json({ success: true, message: 'Login verified via hCaptcha' });

  } catch (error) {
    console.error('🚨 hCaptcha 验证出错:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 发送重置密码邮件
app.post('/api/send-reset-email', sendResetEmailHandler);

// 启动服务
// app.listen(3000, '0.0.0.0', () => {
//   console.log('🚀 服务运行中: http://localhost:3000');
// });
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务运行中: http://localhost:${PORT}`);
});

fs.writeFileSync('/home/LogFiles/test.log', '✅ App started\n', { flag: 'a' });