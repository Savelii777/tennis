import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.logger.log(`JWT_SECRET установлен: ${!!jwtSecret} (первые 4 символа: ${jwtSecret?.substring(0, 4)}...)`);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.log(`Проверка запроса к: ${request.method} ${request.url}`);
    this.logger.debug(`Заголовки запроса: ${JSON.stringify(request.headers)}`);
    
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      this.logger.error('Токен не предоставлен');
      throw new UnauthorizedException('Токен не предоставлен');
    }
    
    this.logger.log(`Токен получен (первые 10 символов): ${token.substring(0, 10)}...`);
    
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
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
    } catch (error) {
      this.logger.error(`Ошибка проверки JWT: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      this.logger.error(`Полная ошибка: ${JSON.stringify(error)}`);
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    this.logger.log(`Заголовок Authorization: ${authHeader || 'отсутствует'}`);
    
    if (!authHeader) return undefined;
    
    const [type, token] = authHeader.split(' ');
    this.logger.log(`Тип токена: ${type}, Токен существует: ${!!token}`);
    
    return type === 'Bearer' ? token : undefined;
  }
}