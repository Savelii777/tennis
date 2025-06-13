import { Injectable } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Ctx } from 'nestjs-telegraf';
import { BotContext } from '../interfaces/context.interface';
import { UsersService } from '../../users/application/services/users.service';
import { SportType } from '../../users/domain/enums/sport-type.enum';

@Injectable()
@Scene('profile-setup')
export class ProfileScene {
  constructor(private readonly usersService: UsersService) {}

  @SceneEnter()
  async enter(@Ctx() ctx: BotContext) {
    await ctx.reply(
      'Заполним ваш профиль. Как вас зовут? (Имя и Фамилия)'
    );
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    if (!ctx.session) {
      ctx.session = {} as any;
    }
    
    if (!ctx.session.profile) {
      ctx.session.profile = {
        step: 0,
      };
    }

    const text = ctx.message.text;

    switch (ctx.session.profile.step) {
      case 0: // Имя и Фамилия
        const nameParts = text.trim().split(' ');
        ctx.session.profile.firstName = nameParts[0];
        ctx.session.profile.lastName = nameParts.slice(1).join(' ');
        ctx.session.profile.step = 1;
        
        await ctx.reply('В каком городе вы играете?');
        break;
        
      case 1: // Город
        ctx.session.profile.city = text;
        ctx.session.profile.step = 2;
        
        await ctx.reply('На каком корте вы чаще всего играете?');
        break;
        
      case 2: // Корт
        ctx.session.profile.preferredCourt = text;
        ctx.session.profile.step = 3;
        
        await ctx.reply(
          'Какой у вас уровень игры?',
          { 
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Новичок (1.0-2.0)', callback_data: 'level_beginner' }],
                [{ text: 'Любитель (2.5-3.5)', callback_data: 'level_amateur' }],
                [{ text: 'Уверенный игрок (4.0-4.5)', callback_data: 'level_confident' }],
                [{ text: 'Турнирный уровень (5.0-6.0)', callback_data: 'level_tournament' }],
                [{ text: 'Полупрофи / тренер', callback_data: 'level_semipro' }],
              ]
            }
          }
        );
        break;
    }
  }
  
  @Action(/level_(.+)/)
  async onLevelSelect(@Ctx() ctx: BotContext) {
    if (!ctx.callbackQuery) return;
    if (!ctx.match) return;
    
    if (!ctx.session) {
      ctx.session = {} as any;
    }
    
    const level = ctx.match[1];
    ctx.session.profile.selfAssessedLevel = level;
    
    let selfAssessedLevel;
    switch (level) {
      case 'beginner': selfAssessedLevel = 'BEGINNER'; break;
      case 'amateur': selfAssessedLevel = 'AMATEUR'; break;
      case 'confident': selfAssessedLevel = 'CONFIDENT'; break;
      case 'tournament': selfAssessedLevel = 'TOURNAMENT'; break;
      case 'semipro': selfAssessedLevel = 'SEMI_PRO'; break;
    }
    
    // Сохраняем данные профиля
    try {
      if (!ctx.callbackQuery.from) return;
      const from = ctx.callbackQuery.from;
      
      const user = await this.usersService.findByTelegramId(from.id.toString());
      
      if (user) {
        // Заполняем первый шаг профиля
        await this.usersService.completeProfileStepOne(user.id.toString(), {
          firstName: ctx.session.profile.firstName,
          lastName: ctx.session.profile.lastName,
          city: ctx.session.profile.city,
          preferredCourt: ctx.session.profile.preferredCourt,
          playsInTournaments: true,
          sportType: SportType.TENNIS // Use enum instead of string
        });
        
        // Заполняем второй шаг с базовыми данными
        await this.usersService.completeProfileStepTwo(user.id.toString(), {
          selfAssessedLevel,
        });
        
        await ctx.reply('Профиль успешно заполнен! Теперь вы можете искать партнеров для игры и участвовать в турнирах.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error saving profile: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при сохранении профиля. Пожалуйста, попробуйте позже.');
    }
    
    // Выходим из сцены
    if (ctx.scene) {
      await ctx.scene.leave();
    }
  }
}