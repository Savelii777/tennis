// import { Module } from '@nestjs/common';
// import { TelegrafModule } from 'nestjs-telegraf';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { BotService } from './bot.service';
// import { TelegramService } from './telegram.service';
// import { TelegramController } from './telegram.controller';
// import { UsersModule } from '../users/users.module';

// @Module({
//   imports: [
//     TelegrafModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => {
//         const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        
//         console.log('🤖 Telegram Module Factory');
//         console.log(`Token exists: ${!!token}`);
        
//         if (!token) {
//           throw new Error('TELEGRAM_BOT_TOKEN не найден в environment');
//         }
        
//         return {
//           token,
//           // НЕ УКАЗЫВАЕМ include - пусть nestjs-telegraf автоматически найдет все классы с @Update()
//         };
//       },
//     }),
//     UsersModule,
//   ],
//   controllers: [TelegramController],
//   providers: [
//     BotService, // ТОЛЬКО BotService
//     TelegramService,
//     // НЕ ДОБАВЛЯЕМ SCENES
//   ],
//   exports: [TelegramService],
// })
// export class TelegramModule {}
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        
        console.log('🤖 Telegram Module Factory');
        console.log(`Token exists: ${!!token}`);
        
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN не найден в environment');
        }
        
        return {
          token,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [TelegramController],
  providers: [
    BotService,
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}