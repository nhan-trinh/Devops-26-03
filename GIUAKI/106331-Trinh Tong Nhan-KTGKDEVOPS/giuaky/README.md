# Từ điển Anh - Việt (Docker Project)

## Giới thiệu

Dự án là một ứng dụng web **từ điển Anh - Việt** đơn giản:

- **Frontend (FE)**: React + Vite — giao diện tra từ, gọi API qua proxy `/api`.
- **Backend (BE)**: Node.js + Express + pg — cung cấp các API:
  - `GET /api/health` — kiểm tra kết nối database
  - `GET /api/words` — danh sách từ
  - `GET /api/define/:word` — tra nghĩa của từ
- **Database (DB)**: Postgres 16 — bảng `words` được khởi tạo sẵn dữ liệu mẫu qua `db/init.sql`.

## Kiến trúc Docker

Dự án được đóng gói thành **3 container riêng biệt**, quản lý bởi `docker-compose.yml`:

| Service | Thư mục build | Dockerfile | Image | Container | Cổng host |
|---------|--------------|------------|-------|-----------|-----------|
| `db`    | `./db`       | `db/Dockerfile` | `giuaky-db` | `dictionary-db` | `55432` (Postgres) |
| `be`    | `./backend`  | `backend/Dockerfile` | `giuaky-be` | `dictionary-be` | `3000` |
| `fe`    | `./frontend` | `frontend/Dockerfile` | `giuaky-fe` | `dictionary-fe` | `8081` (Vite) |

Các container kết nối với nhau qua **mạng nội bộ của Docker Compose** bằng tên service:
FE gọi API qua `http://be:3000` (cấu hình trong `frontend/vite.config.js` qua biến `VITE_API_PROXY`),
BE kết nối DB qua hostname `db` (cấu hình trong `backend/db.js` qua biến `DB_HOST`).

Cấu hình (user/password/database/cổng) được đọc từ file `.env`.

## Cách chạy

Yêu cầu: Docker + Docker Compose đã cài đặt.

```bash
# 1. Build và chạy toàn bộ hệ thống
docker compose up -d --build

# 2. Kiểm tra trạng thái
docker compose ps

# 3. Mở ứng dụng trên trình duyệt
#    Frontend: http://localhost:8081
#    Backend API: http://localhost:3000
#
#    (Nếu muốn đổi cổng, sửa WEB_PORT trong .env)
```

Dừng hệ thống:

```bash
docker compose down          # dừng container (giữ dữ liệu DB)
docker compose down -v       # dừng và XOÁ volume dữ liệu DB
```

## Kiểm tra nhanh

```bash
# 1. API health qua proxy của FE (kiểm tra toàn bộ chuỗi FE -> BE -> DB)
curl http://localhost:8081/api/health
# -> {"db":"connected","words":10}

# 2. API trực tiếp trên BE
curl http://localhost:3000/api/words
curl http://localhost:3000/api/define/apple

# 3. Xem log
docker compose logs -f fe
docker compose logs -f be
docker compose logs -f db
```

## Thông tin sinh viên

Trong image backend (`giuaky-be`) có chứa thư mục `/app/106331/` gồm file `106331.txt`
(lưu họ tên sinh viên). File này được tạo trong `backend/Dockerfile` lúc build image.

```bash
# Xem nội dung file MSSV trong image
docker exec dictionary-be sh -c "cat /app/106331/106331.txt"

# Copy ra máy để mở xem
docker cp dictionary-be:/app/106331/106331.txt .
```

## Cấu trúc thư mục Docker

```
giuaky/
├── docker-compose.yml        # Định nghĩa 3 service: db, be, fe
├── .env                      # Cấu hình: DB user/pass, cổng web, cổng db
├── db/
│   ├── Dockerfile            # Postgres 16 + init.sql nhúng sẵn trong image
│   └── init.sql              # Tạo bảng words + dữ liệu mẫu
├── backend/
│   ├── Dockerfile            # Image BE + thư mục MSSV 106331
│   └── .dockerignore
└── frontend/
    ├── Dockerfile            # Image FE (Vite dev server)
    ├── .dockerignore
    └── vite.config.js        # Proxy /api theo VITE_API_PROXY
```