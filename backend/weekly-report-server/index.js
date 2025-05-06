import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/time-report/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await fs.readFile('./data/usageRecords.json', 'utf-8');
    const allRecords = JSON.parse(data);
    const userRecords = allRecords.filter(r => r.user_id === userId);
    res.json(userRecords);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read usage data' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
