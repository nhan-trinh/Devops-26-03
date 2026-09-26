FROM node:20-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Sao chép toàn bộ mã nguồn backend
COPY . .

# Tạo thư mục MSSV bên trong image chứa thông tin sinh viên
RUN mkdir -p /app/104736 && echo "Nguyễn Xuân Hiếu - 104736" > /app/104736/mssv.txt && \
    mkdir -p /app/MSSV && echo "Nguyễn Xuân Hiếu - 104736" > /app/MSSV/mssv.txt

EXPOSE 3000

CMD ["npm", "start"]
