const { Pool } = require('pg');

// DB_HOST là "db" - tên service trong docker-compose.yml, KHÔNG phải localhost.
// Docker Compose tự tạo DNS nội bộ để các container gọi nhau bằng tên service.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dictionary',
});

module.exports = pool;
