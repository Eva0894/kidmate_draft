import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // 加载 .env 配置

const app = express();
const PORT = 3000;

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体

app.get('/', (req, res) => {
  res.send('✅ Server is running! You reached the backend.');
});

// ✅ 请求日志
app.use((req, res, next) => {
  console.log('📩 收到请求:', req.method, req.url);
  next();
});

// 登录接口（验证 reCAPTCHA）
app.post('/api/login', async (req, res) => {
  console.log('📩 收到 /api/login 请求');
  console.log('📦 请求内容:', req.body);
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing reCAPTCHA token' });
  }

  try {
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    console.log('Google reCAPTCHA 验证结果:', data);

    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes'],
      });
    }

    return res.json({ success: true, message: 'Login verified via reCAPTCHA' });

  } catch (error) {
    console.error('🚨 reCAPTCHA 验证出错:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 启动服务
app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 服务运行中: http://localhost:3000, 局域网: http://192.168.0.249:3000');
});