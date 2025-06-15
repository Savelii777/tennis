import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Origin'
  });

  const config = new DocumentBuilder()
    .setTitle('🎾 Tennis Community API')
    .setDescription(`
      <div style="font-family: 'Segoe UI', sans-serif; line-height: 1.6;">
        <h2>🎾 Добро пожаловать в Tennis Community API!</h2>
        
        <h3>🚀 Полнофункциональное теннисное приложение</h3>
        <p>Современная платформа для теннисного сообщества с богатой функциональностью и интеграциями.</p>
        
        <h4>📱 Основные модули:</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
            <strong>🔐 Auth (Авторизация)</strong><br>
            • Вход через Telegram<br>
            • JWT токены<br>
            • Реферальная регистрация<br>
            • Ролевая система
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
            <strong>👥 Users (Пользователи)</strong><br>
            • Профили игроков<br>
            • Рейтинги и статистика<br>
            • Система мячей (валюта)<br>
            • Загрузка аватаров
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>🎾 Requests (Заявки)</strong><br>
            • Поиск партнеров<br>
            • Создание игровых заявок<br>
            • Отклики и подтверждения<br>
            • Фильтры по уровню
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #dc3545;">
            <strong>⚡ Matches (Матчи)</strong><br>
            • Запись результатов<br>
            • История игр<br>
            • Статистика побед/поражений<br>
            • Рейтинговые матчи
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6f42c1;">
            <strong>🏆 Tournaments (Турниры)</strong><br>
            • Создание турниров<br>
            • Регистрация участников<br>
            • Сетки на выбывание<br>
            • Призовые фонды
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <strong>🏃‍♂️ Trainings (Тренировки)</strong><br>
            • Групповые занятия<br>
            • Запись к тренерам<br>
            • Расписание тренировок<br>
            • Оплата занятий
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #fd7e14;">
            <strong>📱 Stories (Истории)</strong><br>
            • Фото и видео с матчей<br>
            • Временные публикации<br>
            • Лайки и комментарии<br>
            • Модерация контента
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #20c997;">
            <strong>🎁 Cases (Кейсы)</strong><br>
            • Игровые кейсы с призами<br>
            • Система наград<br>
            • Редкие предметы<br>
            • Административное управление
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e83e8c;">
            <strong>🔗 Referrals (Рефералы)</strong><br>
            • Приглашение друзей<br>
            • Бонусные программы<br>
            • Статистика приглашений<br>
            • Достижения за рефералов
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6c757d;">
            <strong>📍 Locations (Локации)</strong><br>
            • Теннисные корты<br>
            • Геолокация<br>
            • Поиск ближайших кортов<br>
            • Отзывы о местах
          </div>
          <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #343a40;">
            <strong>🤖 Telegram Bot</strong><br>
            • Полнофункциональный бот<br>
            • Все возможности через Telegram<br>
            • Push-уведомления<br>
            • Интуитивный интерфейс
          </div>
        </div>
        
        <h4>🔐 Как начать работу:</h4>
        <ol style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
          <li><strong>Авторизация:</strong> Используйте <code>POST /auth/login-telegram</code></li>
          <li><strong>Получите токен:</strong> Скопируйте <code>access_token</code> из ответа</li>
          <li><strong>Авторизуйтесь:</strong> Нажмите <strong>Authorize</strong> и введите токен</li>
          <li><strong>Тестируйте API:</strong> Все эндпоинты теперь доступны!</li>
        </ol>
        
        <h4>🛠️ Полезные инструменты:</h4>
        <ul style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <li><a href="/api/auth-helper" target="_blank">🔧 Помощник авторизации с быстрым входом</a></li>
          <li><a href="/api-json" target="_blank">📋 OpenAPI спецификация (JSON)</a></li>
          <li><a href="https://t.me/your_tennis_bot" target="_blank">🤖 Telegram бот</a></li>
        </ul>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>💡 Совет:</strong> Для быстрого тестирования используйте помощник авторизации - он автоматически настроит токены для разных ролей (пользователь, админ, организатор).
        </div>
      </div>
    `)
    .setVersion('2.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '🔑 Введите JWT токен с префиксом Bearer',
        in: 'header'
      },
      'access-token'
    )
    .addTag('auth', '🔐 Авторизация и аутентификация')
    .addTag('users', '👥 Пользователи и профили')  
    .addTag('requests', '🎾 Заявки на игру')
    .addTag('matches', '⚡ Матчи и результаты')
    .addTag('tournaments', '🏆 Турниры и соревнования')
    .addTag('trainings', '🏃‍♂️ Тренировки и занятия')
    .addTag('stories', '📱 Stories и медиа')
    .addTag('cases', '🎁 Кейсы и призы')
    .addTag('admin-cases', '⚙️ Администрирование кейсов')
    .addTag('referrals', '🔗 Реферальная система')
    .addTag('locations', '📍 Локации и корты')
    .addTag('media', '📸 Загрузка файлов')
    .addTag('telegram', '🤖 Telegram интеграция')
    .setContact('Tennis Community Support', 'https://t.me/support', 'support@tennis.app')
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('📚 Документация проекта', 'https://github.com/your-repo/tennis-app')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  logger.log(`Настройка Swagger UI...`);
  logger.log(`JWT_SECRET установлен: ${!!process.env.JWT_SECRET}`);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 0,
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        const authKey = Object.keys(window.localStorage).find(key => key.startsWith('authorized') && key.includes('access-token'));
        
        if (authKey) {
          try {
            const authData = JSON.parse(window.localStorage.getItem(authKey) || '{}');
            if (authData.value) {
              const token = authData.value.startsWith('Bearer ') 
                ? authData.value 
                : `Bearer ${authData.value}`;
              
              req.headers['Authorization'] = token;
              console.log('Добавлен заголовок Authorization:', token.substring(0, 20) + '...');
            }
          } catch (e) {
            console.error('Ошибка при получении токена', e);
          }
        }
        return req;
      },
      responseInterceptor: (res: any) => {
        console.log('Response status:', res.status);
        return res;
      }
    },
    customSiteTitle: 'Tennis API - Документация',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .information-container { padding: 20px; background-color: #f8f9fa; border-radius: 5px; }
      .swagger-ui .auth-wrapper { display: flex; justify-content: center; margin: 10px 0 15px; }
      .swagger-ui .authorization__btn { font-size: 16px; padding: 10px 20px; }
      .swagger-ui .auth-container input { font-size: 14px; padding: 8px; width: 100%; }
      .swagger-ui .auth-container h4 { font-weight: bold; margin-bottom: 10px; }
    `
  });

  app.use('/api/auth-helper', (req: any, res: any) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.send(`
      <html>
        <head>
          <title>Помощник авторизации API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .steps { background-color: #f8f9fa; }
            input { width: 100%; padding: 8px; margin-bottom: 10px; }
            button { background: #4990e2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
            h3 { color: #333; }
            code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h2>Помощник авторизации для Tennis API через ${req.get('host')}</h2>
          
          <div class="card steps">
            <h3>Шаг 1: Получите токен через эндпоинт /auth/login/telegram</h3>
            <p>Выполните POST запрос со следующими данными:</p>
            <pre>{
  "id": "123456789",
  "hash": "valid_hash",
  "username": "admin",
  "first_name": "Admin",
  "last_name": "",
  "photo_url": "",
  "auth_date": "1654837742"
}</pre>
          </div>
          
          <div class="card">
            <h3>Шаг 2: Введите полученный токен</h3>
            <input id="token-input" type="text" placeholder="Вставьте токен из ответа (access_token)">
            <button id="save-token">Сохранить токен в браузере</button>
            <p id="status"></p>
          </div>
          
          <div class="card">
            <h3>Шаг 3: Вернитесь в Swagger UI</h3>
            <p>Токен будет автоматически добавлен в заголовок Authorization для всех запросов.</p>
            <a href="${baseUrl}/api"><button>Вернуться в Swagger UI</button></a>
          </div>
          
          <script>
            document.getElementById('save-token').addEventListener('click', function() {
              const token = document.getElementById('token-input').value.trim();
              if (!token) {
                document.getElementById('status').textContent = 'Введите токен!';
                document.getElementById('status').className = 'error';
                return;
              }
              
              try {
                const authKey = 'authorized-access-token';
                const authValue = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
                localStorage.setItem(authKey, JSON.stringify({
                  name: 'access-token',
                  schema: { type: 'http', scheme: 'bearer' },
                  value: authValue
                }));
                
                document.getElementById('status').textContent = 'Токен сохранен! Теперь вы можете использовать API.';
                document.getElementById('status').className = 'success';
              } catch (e) {
                document.getElementById('status').textContent = 'Ошибка при сохранении токена: ' + e.message;
                document.getElementById('status').className = 'error';
              }
            });
          </script>
        </body>
      </html>
    `);
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0'); 
  console.log(`Приложение запущено на порту ${PORT}`);
  console.log(`Документация API доступна по адресу: http://localhost:${PORT}/api`);
  console.log(`Помощник авторизации доступен по адресу: http://localhost:${PORT}/api/auth-helper`);
}
bootstrap();