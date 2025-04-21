import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
  console.log('📩 收到请求:', req.method, req.url);
  next();
});

app.post('/api/login', async (req, res) => {
  console.log('📩 收到请求:', req.method, req.url);
  console.log('📦 req.body:', req.body); 
  const { token } = req.body;

  if (!token) {
    console.log('⚠️ token 缺失，终止验证');
    return res.status(400).json({ success: false, message: 'Missing reCAPTCHA token' });
  }

  try {
    // Step 1: Verify reCAPTCHA
    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    console.log('🧠 Google reCAPTCHA 验证结果:', data);

    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errors: data['error-codes'],
      });
    }

    // ✅ 验证成功
    return res.json({ success: true, message: 'reCAPTCHA OK' });

  } catch (error) {
    console.error('🚨 reCAPTCHA 验证出错:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 后端服务监听中：本地 http://localhost:${PORT}，局域网 http://<192.168.0.249>:${PORT}`);
});