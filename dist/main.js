"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Настройка глобальных пайпов
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    // Настройка CORS для доступа из браузера
    app.enableCors();
    // Улучшенная настройка Swagger для пользователей
    const config = new swagger_1.DocumentBuilder()
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
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header'
    }, 'access-token')
        .addTag('auth', 'Авторизация и управление профилем')
        .addTag('users', 'Управление пользователями и профилями')
        .addTag('tournaments', 'Создание и участие в турнирах')
        .addTag('matches', 'Управление матчами')
        .addTag('media', 'Загрузка файлов и управление медиа')
        .setExternalDoc('Подробная документация', 'https://example.com/docs')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    // Улучшенная настройка Swagger UI для лучшего UX
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: 0,
            filter: true,
            displayRequestDuration: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai'
            }
        },
        customSiteTitle: 'Tennis API - Интерактивная документация',
        customCss: '.swagger-ui .topbar { display: none } .swagger-ui .information-container { padding: 20px; background-color: #f8f9fa; border-radius: 5px; } .swagger-ui .auth-wrapper { display: flex; justify-content: center; margin: 10px 0 15px; }'
    });
    // Запуск приложения
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    console.log(`Приложение запущено на порту ${PORT}`);
    console.log(`Документация API доступна по адресу: http://localhost:${PORT}/api`);
}
bootstrap();
