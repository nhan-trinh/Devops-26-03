-- File này được image postgres tự động chạy LẦN ĐẦU khi volume dữ liệu còn rỗng.
-- Muốn chạy lại sau khi sửa file: docker compose down -v (xoá volume) rồi up lại.

CREATE TABLE IF NOT EXISTS words (
  id         SERIAL PRIMARY KEY,
  word       VARCHAR(100) NOT NULL UNIQUE,
  definition TEXT         NOT NULL
);

-- Migrate dữ liệu từ backend/dictionary.js (đã xoá) sang database
INSERT INTO words (word, definition) VALUES
  ('apple',    'quả táo'),
  ('book',     'quyển sách'),
  ('computer', 'máy tính'),
  ('dog',      'con chó'),
  ('elephant', 'con voi'),
  ('flower',   'bông hoa'),
  ('guitar',   'đàn guitar'),
  ('house',    'ngôi nhà'),
  ('internet', 'mạng internet'),
  ('juice',    'nước ép')
ON CONFLICT (word) DO NOTHING;
