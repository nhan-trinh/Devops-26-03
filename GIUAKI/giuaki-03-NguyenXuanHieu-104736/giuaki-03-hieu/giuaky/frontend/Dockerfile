# Stage 1: Build source code React bằng Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Phục vụ ứng dụng qua Nginx
FROM nginx:alpine

# Copy cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy thư mục dist đã build sang web root của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Tạo thư mục MSSV bên trong image chứa thông tin sinh viên
RUN mkdir -p /104736 && echo "Nguyễn Xuân Hiếu - 104736" > /104736/mssv.txt && \
    mkdir -p /MSSV && echo "Nguyễn Xuân Hiếu - 104736" > /MSSV/mssv.txt && \
    mkdir -p /usr/share/nginx/html/104736 && echo "Nguyễn Xuân Hiếu - 104736" > /usr/share/nginx/html/104736/mssv.txt && \
    mkdir -p /usr/share/nginx/html/MSSV && echo "Nguyễn Xuân Hiếu - 104736" > /usr/share/nginx/html/MSSV/mssv.txt

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
