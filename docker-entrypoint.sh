#!/bin/sh
# filepath: /Users/mac/Desktop/backend sport/tennis-app-backend/docker-entrypoint.sh

set -e

echo "🚀 Запуск Tennis App..."

# Ждем готовности базы данных
echo "⏳ Ожидание готовности PostgreSQL..."
while ! nc -z postgres 5432; do
  echo "PostgreSQL не готов - ждем..."
  sleep 2
done
echo "✅ PostgreSQL готов!"

# Проверяем что Prisma схема существует
if [ -f "src/prisma/schema.prisma" ]; then
    echo "🔧 Генерация Prisma Client..."
    npx prisma generate
    
    echo "📦 Применение миграций Prisma..."
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Миграции применены успешно"
        
        # Проверяем есть ли данные в БД
        echo "🔍 Проверка данных в базе..."
        if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
            USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"User\";" 2>/dev/null | grep -o '"count":"[0-9]*"' | grep -o '[0-9]*' || echo "0")
            
            if [ "$USER_COUNT" = "0" ]; then
                echo "🌱 База данных пуста, запускаем сиды..."
                npx prisma db seed
                
                if [ $? -eq 0 ]; then
                    echo "✅ Сиды выполнены успешно"
                else
                    echo "⚠️ Предупреждение: ошибка выполнения сидов"
                fi
            else
                echo "ℹ️ База данных уже содержит данные ($USER_COUNT пользователей), пропускаем сиды"
            fi
        else
            echo "⚠️ Не удалось проверить данные в БД, пропускаем сиды"
        fi
    else
        echo "⚠️ Ошибка применения миграций, продолжаем без них..."
    fi
else
    echo "⚠️ Prisma схема не найдена, запускаем приложение без настройки БД"
fi

# Создаем необходимые директории
echo "📁 Создание директорий..."
mkdir -p /app/uploads/avatars
mkdir -p /app/uploads/stories  
mkdir -p /app/uploads/media
mkdir -p /app/logs

# Устанавливаем права доступа
chmod 755 /app/uploads /app/logs
chmod 755 /app/uploads/avatars /app/uploads/stories /app/uploads/media

echo "🎾 Запуск Tennis App сервера..."

# Запускаем основное приложение
exec "$@"