"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthGuard = class AuthGuard {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger('AuthGuard');
        const jwtSecret = this.configService.get('JWT_SECRET');
        this.logger.log(`JWT_SECRET установлен: ${!!jwtSecret} (первые 4 символа: ${jwtSecret?.substring(0, 4)}...)`);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        this.logger.log(`Проверка запроса к: ${request.method} ${request.url}`);
        this.logger.debug(`Заголовки запроса: ${JSON.stringify(request.headers)}`);
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logger.error('Токен не предоставлен');
            throw new common_1.UnauthorizedException('Токен не предоставлен');
        }
        this.logger.log(`Токен получен (первые 10 символов): ${token.substring(0, 10)}...`);
        try {
            const jwtSecret = this.configService.get('JWT_SECRET');
            this.logger.log(`Проверка токена с секретом: ${jwtSecret?.substring(0, 4)}...`);
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret
            });
            this.logger.log(`Токен успешно проверен`);
            this.logger.debug(`Payload токена: ${JSON.stringify(payload)}`);
            request['user'] = {
                id: payload.sub || payload.id,
                username: payload.username,
                role: payload.role
            };
            this.logger.log(`Пользователь в запросе: ${JSON.stringify(request['user'])}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Ошибка проверки JWT: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            this.logger.error(`Полная ошибка: ${JSON.stringify(error)}`);
            throw new common_1.UnauthorizedException('Недействительный токен');
        }
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers.authorization;
        this.logger.log(`Заголовок Authorization: ${authHeader || 'отсутствует'}`);
        if (!authHeader)
            return undefined;
        const [type, token] = authHeader.split(' ');
        this.logger.log(`Тип токена: ${type}, Токен существует: ${!!token}`);
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AuthGuard);
