# web_api
# Для запуска:
1) npm install
2) docker-compose up -d
3) npx prisma migrate dev or npm run migrate:dev
# Старт сервиса:
1) npm run dev
# Старт тестов:
1) npm run test

# Env
Для корректной работы необходимо добавить SENDGRID_API_KEY= в .env 
Ссылка для создания ключа и регистрации: https://sendgrid.com/

JWT_SECRET= можно создать здесь: https://www.javainuse.com/jwtgenerator
