# Postgres + sẵn dữ liệu khởi tạo NẰM TRONG image (không cần bind mount).
#
# Vì sao cần file này?
#   docker-compose.yml gốc mount "./db/init.sql" vào container - chạy tay ở máy
#   thì đúng, nhưng khi Jenkins (trong container) gọi Docker của host qua
#   /var/run/docker.sock thì daemon tìm đường dẫn đó TRÊN HOST, không phải trong
#   container Jenkins. Đường dẫn /var/jenkins_home/... không tồn tại trên host
#   -> Docker mount một thư mục rỗng -> Postgres không chạy init.sql
#   -> lỗi 'relation "words" does not exist'.
#
# Nhúng thẳng vào image thì chạy đúng ở MỌI nơi: máy cá nhân, Jenkins, runner CI.

FROM postgres:16-alpine

# Postgres tự chạy mọi file trong thư mục này khi khởi tạo lần đầu
# (chỉ chạy khi volume dữ liệu còn rỗng).
COPY init.sql /docker-entrypoint-initdb.d/init.sql
