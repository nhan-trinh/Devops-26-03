FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js db.js ./

# Thư mục MSSV của sinh viên (hiển thị trong image khi cần kiểm tra)
RUN mkdir -p /app/106331 && echo "Trịnh Tống Nhẫn" > /app/106331/106331.txt

EXPOSE 3000

CMD ["node", "server.js"]