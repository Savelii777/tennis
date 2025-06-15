# Используем Node.js 20 Alpine для меньшего размера
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache openssl curl netcat-openbsd

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Генерируем Prisma Client (если есть схема)
RUN if [ -f "src/prisma/schema.prisma" ]; then npx prisma generate; fi

# Собираем TypeScript проект
RUN npm run build

# Создаем директории для uploads
RUN mkdir -p uploads/avatars uploads/stories uploads/media
RUN mkdir -p logs

# Устанавливаем права доступа
RUN chmod 755 uploads logs

# Открываем порт
EXPOSE 3000

# Копируем скрипт запуска
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Запускаем через entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]