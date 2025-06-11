import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('JWT_SECRET') || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        inject: [ConfigService],
      }),
    ],
    providers: [JwtService],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

export function createTestToken(userId = 1): string {
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'test-secret',
  });
  
  return jwtService.sign({ id: userId, username: 'testuser' });
}