import { useEffect, useState } from 'react';

function App() {
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);

  // Kiểm tra kết nối tới database để hiển thị badge trạng thái
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ db: 'disconnected' }));
  }, []);

  // Lấy danh sách từ để đổ vào listbox
  useEffect(() => {
    fetch('/api/words')
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        if (data.length > 0) setSelectedWord(data[0]);
      })
      .catch(() => setDefinition('Không kết nối được tới server'));
  }, []);

  // Mỗi khi đổi từ trong listbox, gọi API tra nghĩa
  useEffect(() => {
    if (!selectedWord) return;
    setLoading(true);
    fetch(`/api/define/${selectedWord}`)
      .then((res) => res.json())
      .then((data) => setDefinition(data.definition || data.error))
      .finally(() => setLoading(false));
  }, [selectedWord]);

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        maxWidth: 480,
        margin: '60px auto',
        textAlign: 'center',
      }}
    >
      <h1>Tra từ điển Anh - Việt</h1>

      {/* Badge trạng thái kết nối database */}
      <div
        style={{
          display: 'inline-block',
          marginBottom: 20,
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 14,
          backgroundColor: health?.db === 'connected' ? '#e6f4ea' : '#fce8e6',
          color: health?.db === 'connected' ? '#137333' : '#c5221f',
        }}
      >
        {health === null
          ? 'Đang kiểm tra database...'
          : health.db === 'connected'
          ? `Database: đã kết nối (${health.words} từ)`
          : 'Database: mất kết nối'}
      </div>

      <select
        value={selectedWord}
        onChange={(e) => setSelectedWord(e.target.value)}
        style={{ fontSize: 16, padding: 8, width: '100%' }}
      >
        {words.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 24, fontSize: 20, minHeight: 40 }}>
        {loading ? 'Đang tra...' : definition}
      </div>
    </div>
  );
}

export default App;
