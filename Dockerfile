# Используем Node.js 20 Alpine для меньшего размера
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apk add --no-cache openssl curl netcat-openbsd

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая dev-зависимости)
RUN npm install

# Устанавливаем глобально нужные пакеты
RUN npm install -g @nestjs/cli ts-node typescript

# Копируем весь исходный код
COPY . .

# НЕ генерируем Prisma Client здесь - делаем это в runtime
# чтобы избежать проблем с путями

# Создаем директории для uploads
RUN mkdir -p uploads/avatars uploads/stories uploads/media
RUN mkdir -p logs

# Устанавливаем права доступа
RUN chmod 755 uploads logs

# Открываем порт для приложения
EXPOSE 3000
# Открываем порт для отладки
EXPOSE 9229

# Копируем скрипт запуска
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Запускаем через entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:debug"]