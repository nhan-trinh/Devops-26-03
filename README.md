# PingUp - Real-time Social Media Platform (SCM)

PingUp là một nền tảng mạng xã hội thời gian thực toàn diện, được xây dựng trên kiến trúc Microservices / Multi-containers hiện đại, hỗ trợ đầy đủ các tính năng tương tác mạng xã hội, chat tức thời, thông báo thời gian thực và tự động hóa tác vụ ngầm.

---

## 🚀 Các Tính Năng Nổi Bật

- **Xác thực & Bảo mật (Clerk Auth)**:
  - Đăng nhập / Đăng ký qua Clerk (`@clerk/clerk-react`, `@clerk/express`).
  - Hỗ trợ cơ chế **JIT Auto-Provisioning**: Tự động đồng bộ tài khoản từ Clerk vào cơ sở dữ liệu MongoDB ngay khi đăng nhập.
- **Bảng tin & Bài viết (Feed & Posts)**:
  - Đăng bài viết kèm ảnh (tối ưu hóa CDN qua ImageKit).
  - Tương tác: Thích (Like), Chia sẻ (Share), Bình luận đa cấp (Comment & Reply).
- **Tin 24 Giờ (Stories)**:
  - Đăng story hình ảnh.
  - Tự động hết hạn và xóa dữ liệu sau 24h bằng background worker (Inngest).
- **Kết nối Bạn bè & Theo dõi**:
  - Gửi yêu cầu kết nối, chấp nhận kết nối.
  - Theo dõi / Bỏ theo dõi (Follow / Unfollow).
- **Chat Thời Gian Thực (Direct Messaging)**:
  - Xây dựng trên Socket.IO với phòng chat riêng biệt (`user_${userId}`).
  - Trạng thái người dùng đang soạn tin nhắn (`typing` / `stopped-typing`).
- **Hệ thống Thông Báo Tức Thời (Real-time Notifications)**:
  - Gửi thông báo ngay lập tức qua Socket.IO khi có like, comment, share, follow, story mới.
  - Quản lý trạng thái đã đọc, đánh dấu đọc tất cả, xóa thông báo và bộ đếm badge chưa đọc.
- **Thông Báo Qua Email**:
  - Tích hợp Brevo SMTP qua Nodemailer gửi email thông báo hoạt động mới.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện chính |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Redux Toolkit, Socket.io-client, Lucide Icons, i18next, Nginx 1.27 Alpine |
| **Backend** | Node.js 22, Express 5, Mongoose 8, Socket.IO, `@clerk/express`, Inngest SDK, ImageKit, Nodemailer |
| **Cơ sở dữ liệu** | MongoDB 7, Mongo Express (Giao diện Web GUI quản trị DB) |
| **Tác vụ ngầm (Background Jobs)** | Inngest Dev Server |
| **DevOps & Triển khai** | Docker, Docker Compose, Multi-stage Builds |

---

## 📦 Kiến Trúc Các Dịch Vụ (Docker Compose Services)

Dự án được đóng gói hoàn chỉnh bằng Docker Compose với mạng nội bộ riêng biệt `scm-network`:

| Service | Vai trò | Port (Host : Container) | Trạng thái / Healthcheck |
| :--- | :--- | :--- | :--- |
| **`frontend`** | Giao diện React SPA serve qua Nginx | `5173:80` | Phụ thuộc Backend Healthy |
| **`backend`** | REST API, Webhook & Socket.IO Server | `4000:4000` | Node.js fetch healthcheck (`/`) |
| **`mongodb`** | Cơ sở dữ liệu chính | `27017:27017` | Mongosh ping healthcheck |
| **`inngest`** | Background Job Server & Dev Dashboard | `8288:8288`, `8289:8289` | Đồng bộ API `/api/inngest` |
| **`mongo-express`** | Giao diện Web GUI xem DB MongoDB | `8081:8081` | Phụ thuộc MongoDB Healthy |

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy Bằng Docker

### 1. Yêu cầu hệ thống
- Đã cài đặt **Docker** và **Docker Compose** (Docker Desktop trên Windows/Mac hoặc Docker Engine trên Linux).
- Đã có tài khoản Clerk, ImageKit và SMTP (Brevo) hoặc dùng các thông tin có sẵn trong file `.env`.

### 2. Cấu hình biến môi trường
Tạo các file `.env` từ file mẫu:
- **Server**: Tạo `server/.env` (dựa trên `server/.env.example`)
- **Client**: Tạo `client/.env` (dựa trên `client/.env.example`)

> **Lưu ý về MongoDB**:
> - Mặc định backend sẽ kết nối tới MongoDB Atlas qua biến `MONGODB_URL` trong `server/.env`.
> - Nếu muốn chạy hoàn toàn bằng container MongoDB local, chỉ cần sửa trong `server/.env`:
>   ```env
>   MONGODB_URL=mongodb://mongodb:27017
>   ```

### 3. Khởi chạy toàn bộ hệ thống
Tại thư mục gốc của dự án, chạy lệnh:

```bash
docker compose up -d --build
```

### 4. Truy cập các dịch vụ

Sau khi khởi chạy, mở trình duyệt và truy cập:

- **Frontend (Giao diện người dùng)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)
- **Bảng điều khiển Inngest Dev**: [http://localhost:8288](http://localhost:8288)
- **Mongo Express (DB GUI)**: [http://localhost:8081](http://localhost:8081)

---

## 🔧 Các Lệnh Quản Lý Docker Thường Dùng

- **Kiểm tra trạng thái các container**:
  ```bash
  docker compose ps
  ```
- **Xem logs của một service cụ thể**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f inngest
  ```
- **Khởi động lại một service**:
  ```bash
  docker compose restart backend
  ```
- **Dừng toàn bộ hệ thống**:
  ```bash
  docker compose down
  ```
- **Dừng hệ thống và xóa toàn bộ dữ liệu volume**:
  ```bash
  docker compose down -v
  ```

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Không Dùng Docker)

### Backend
```bash
cd server
npm install
npm run server
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🛠️ Hướng Dẫn Cấu Hình CI/CD Với Jenkins

Dự án đã được tích hợp sẵn luồng CI/CD hoàn chỉnh bằng Jenkins, giúp tự động hóa quá trình Build, Push Docker Images và Deploy (sử dụng DooD - Docker outside of Docker).

### Các File Cấu Hình Chính:
- **Jenkinsfile**: Chứa kịch bản (pipeline) các bước thực thi (Chuẩn bị, Build Frontend & Backend đa nền tảng, Push lên GHCR, Pull và Deploy).
- **docker-compose.prod.yml**: Ghi đè cấu hình để Jenkins không tự build lại mã nguồn mà kéo trực tiếp Image đã được test từ Registry về chạy.
- **Tự động xử lý cấu hình**: Pipeline tự động sao chép server/.env.example thành .env để vượt qua bài kiểm tra khóa (keys) của Clerk & ImageKit lúc khởi động.

### Các Bước Cài Đặt Trên Jenkins:

1. Đăng nhập vào Jenkins (ví dụ: http://localhost:8080).
2. Tại màn hình **Dashboard**, bấm **New Item**.
3. Nhập tên dự án (ví dụ: devops-26-03-cicd), chọn **Pipeline**, sau đó bấm **OK**.
4. Cuộn xuống phần **Pipeline** và thiết lập chính xác như sau:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** Đường dẫn kho lưu trữ (ví dụ: https://github.com/nhan-trinh/Devops-26-03.git)
   - **Branch Specifier:** Nhánh hiện tại của dự án (ví dụ: */master)
   - **Script Path:** Jenkinsfile
5. Bấm **Save**.
6. Tại giao diện dự án, bấm **▶ Build Now** để Jenkins tự động thực thi.

Khi quá trình kết thúc với thông báo **SUCCESS**, hệ thống sẽ tự động lên sóng và cập nhật phiên bản mới nhất!

---

## 📄 Bản Quyền & Giấy Phép

Dự án phục vụ mục đích học tập, nghiên cứu và phát triển phần mềm theo chuẩn DevOps.

---
