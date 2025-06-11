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
    .setTitle('Tennis API')
    .setDescription(`
      <h3>Документация API для теннисного приложения</h3>
      <p>Добро пожаловать в документацию API теннисного приложения. Здесь вы можете протестировать все доступные эндпоинты.</p>
      <h4>Как использовать:</h4>
      <ol>
        <li>Для начала работы авторизуйтесь через <code>/auth/login-telegram</code> эндпоинт</li>
        <li>Используйте полученный токен в кнопке Authorize вверху страницы</li>
        <li>После этого вы можете тестировать любые эндпоинты</li>
      </ol>
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Введите токен с префиксом Bearer: Bearer [token]',
        in: 'header'
      },
      'access-token'
    )
    .addTag('auth', 'Авторизация и управление профилем')
    .addTag('users', 'Управление пользователями и профилями')
    .addTag('tournaments', 'Создание и участие в турнирах')
    .addTag('matches', 'Управление матчами')
    .addTag('media', 'Загрузка файлов и управление медиа')
    .setExternalDoc('Подробная документация', 'https://example.com/docs')
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