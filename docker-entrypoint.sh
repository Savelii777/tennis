#!/bin/sh
# filepath: /Users/mac/Desktop/backend sport/tennis-app-backend/docker-entrypoint.sh

set -e

echo "🚀 Запуск Tennis App в режиме разработки..."

# Ждем готовности базы данных
echo "⏳ Ожидание готовности PostgreSQL..."
while ! nc -z postgres 5432; do
  echo "PostgreSQL не готов - ждем..."
  sleep 2
done
echo "✅ PostgreSQL готов!"

# Проверяем что Prisma схема существует
if [ -f "src/prisma/schema.prisma" ]; then
    echo "✅ Найден файл src/prisma/schema.prisma"
    
    echo "🔧 Генерация Prisma Client в runtime..."
    npx prisma generate --schema=src/prisma/schema.prisma
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma Client сгенерирован успешно"
        
        echo "📦 Применение миграций Prisma..."
        npx prisma migrate deploy --schema=src/prisma/schema.prisma
        
        if [ $? -eq 0 ]; then
            echo "✅ Миграции применены успешно"
            
            # Проверяем есть ли данные в БД (упрощенный способ)
            echo "🔍 Проверка данных в базе..."
            
            # Создаем временный SQL файл для проверки
            echo "SELECT COUNT(*) as count FROM \"User\";" > /tmp/check_users.sql
            
            USER_COUNT=$(npx prisma db execute --file /tmp/check_users.sql --schema=src/prisma/schema.prisma 2>/dev/null | grep -o '"count":"[0-9]*"' | grep -o '[0-9]*' || echo "0")
            
            if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
                echo "🌱 База данных пуста, запускаем сиды..."
                npm run db:seed
                
                if [ $? -eq 0 ]; then
                    echo "✅ Сиды выполнены успешно"
                else
                    echo "⚠️ Предупреждение: ошибка выполнения сидов"
                fi
            else
                echo "ℹ️ База данных уже содержит данные ($USER_COUNT пользователей), пропускаем сиды"
            fi
            
            # Удаляем временный файл
            rm -f /tmp/check_users.sql
        else
            echo "⚠️ Ошибка применения миграций, продолжаем без них..."
        fi
    else
        echo "❌ Ошибка генерации Prisma Client"
        echo "🔧 Пробуем альтернативный способ..."
        
        # Создаем символическую ссылку на стандартное место
        mkdir -p prisma
        ln -sf ../src/prisma/schema.prisma prisma/schema.prisma 2>/dev/null || true
        ln -sf ../src/prisma/migrations prisma/migrations 2>/dev/null || true
        
        npx prisma generate
        npx prisma migrate deploy
        
        # Простая проверка и запуск сидов
        echo "🌱 Запускаем сиды..."
        npm run db:seed || echo "⚠️ Сиды не выполнены"
    fi
elif [ -f "prisma/schema.prisma" ]; then
    echo "✅ Найден файл prisma/schema.prisma"
    
    npx prisma generate
    npx prisma migrate deploy
    
    echo "🌱 Запускаем сиды..."
    npm run db:seed || echo "⚠️ Сиды не выполнены"
else
    echo "⚠️ Prisma схема не найдена ни в src/prisma/, ни в prisma/"
    echo "📋 Содержимое корневой папки:"
    ls -la
    echo "📋 Попытка найти файлы схемы:"
    find . -name "schema.prisma" -type f 2>/dev/null || echo "Файлы schema.prisma не найдены"
fi

# Создаем необходимые директории
echo "📁 Создание директорий..."
mkdir -p /app/uploads/avatars
mkdir -p /app/uploads/stories  
mkdir -p /app/uploads/media
mkdir -p /app/logs

# Устанавливаем права доступа
chmod 755 /app/uploads /app/logs 2>/dev/null || true
chmod 755 /app/uploads/* 2>/dev/null || true

echo "🎾 Запуск Tennis App сервера в режиме разработки..."

# Запускаем основное приложение
exec "$@"