# Stage 1: Build React Frontend
FROM node:18-alpine AS build-frontend
WORKDIR /app/frontend

# Copy package.json và cài đặt dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source code và build ra file tĩnh
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Node.js Backend & kết hợp
FROM node:18-alpine
WORKDIR /app

# Copy package.json của backend và cài đặt dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy source code của backend
COPY backend/ ./

# Copy file đã build từ frontend sang thư mục public của backend để express phục vụ
COPY --from=build-frontend /app/frontend/dist ./public

# ==============================================================================
# TODO: YÊU CẦU CỦA BÀI THI - THAY ĐỔI MSSV VÀ HỌ TÊN Ở DƯỚI ĐÂY
# ==============================================================================

RUN mkdir -p /MSSV && \
    echo "Mai Ngoc Phuc" > /MSSV/106176.txt
# ==============================================================================

# Expose port (Backend chạy cổng 3000)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
