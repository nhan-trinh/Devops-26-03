const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// API: kiểm tra kết nối database (dùng cho badge trạng thái trên web)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM words');
    res.json({ db: 'connected', words: Number(result.rows[0].count) });
  } catch (err) {
    res.status(503).json({ db: 'disconnected', error: err.message });
  }
});

// API: lấy danh sách từ (để đổ vào listbox)
app.get('/api/words', async (req, res) => {
  try {
    const result = await pool.query('SELECT word FROM words ORDER BY word');
    res.json(result.rows.map((row) => row.word));
  } catch (err) {
    res.status(503).json({ error: 'Không truy vấn được database' });
  }
});

// API: tra nghĩa 1 từ cụ thể
app.get('/api/define/:word', async (req, res) => {
  const word = req.params.word.toLowerCase();
  try {
    const result = await pool.query(
      'SELECT word, definition FROM words WHERE word = $1',
      [word]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy từ này' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(503).json({ error: 'Không truy vấn được database' });
  }
});

// Phục vụ file tĩnh của React (đã build sẵn vào thư mục public)
app.use(express.static(path.join(__dirname, 'public')));

// Mọi route khác trả về index.html (để React Router hoạt động nếu sau này mở rộng)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
