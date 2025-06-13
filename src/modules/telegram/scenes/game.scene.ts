import { Injectable } from '@nestjs/common';
import { Scene, SceneEnter, Action, On, Ctx } from 'nestjs-telegraf';
import { BotContext } from '../interfaces/context.interface';
import { RequestsService } from '../../requests/application/services/requests.service';
import { UsersService } from '../../users/application/services/users.service';
import { RequestType } from '../../requests/domain/enums/request-type.enum';

@Injectable()
@Scene('create-game')
export class GameScene {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly usersService: UsersService,
  ) {}

  @SceneEnter()
  async enter(@Ctx() ctx: BotContext) {
    if (!ctx.session) {
      ctx.session = {} as any;
    }
    
    ctx.session.game = {
      step: 0,
      data: {
        type: 'SINGLE_GAME',
      }
    };
    
    await ctx.reply(
      'Создаем заявку на игру. Введите название (например: "Игра в субботу" или "Ищу спарринг")'
    );
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (!ctx.session || !ctx.session.game) return;
    
    const text = ctx.message.text;
    
    switch (ctx.session.game.step) {
      case 0: // Название
        ctx.session.game.data.title = text;
        ctx.session.game.step = 1;
        
        await ctx.reply('Добавьте краткое описание (или напишите "нет" чтобы пропустить)');
        break;
        
      case 1: // Описание
        ctx.session.game.data.description = text !== 'нет' ? text : '';
        ctx.session.game.step = 2;
        
        await ctx.reply('Укажите место проведения (корт)');
        break;
        
      case 2: // Место
        ctx.session.game.data.locationName = text;
        ctx.session.game.step = 3;
        
        await ctx.reply(
          'Выберите формат игры:',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Одиночный (1x1)', callback_data: 'format_ONE_ON_ONE' }],
                [{ text: 'Парный (2x2)', callback_data: 'format_DOUBLES' }],
              ]
            }
          }
        );
        break;
        
      case 4: // Дата и время (ввод текстом)
        try {
          const dateTime = new Date(text);
          if (isNaN(dateTime.getTime())) {
            await ctx.reply('Неверный формат даты. Пожалуйста, введите в формате ГГГГ-ММ-ДД ЧЧ:ММ (например, 2025-07-15 18:00)');
            return;
          }
          
          ctx.session.game.data.dateTime = dateTime;
          ctx.session.game.step = 5;
          
          await ctx.reply(
            'Как оплачиваем корт?',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'Поровну (50/50)', callback_data: 'payment_DIVIDED' }],
                  [{ text: 'Проигравший платит', callback_data: 'payment_LOSER_PAYS' }],
                  [{ text: 'Организатор платит', callback_data: 'payment_HOST_PAYS' }],
                  [{ text: 'Бесплатно', callback_data: 'payment_FREE' }],
                ]
              }
            }
          );
        } catch (error) {
          await ctx.reply('Неверный формат даты. Пожалуйста, введите в формате ГГГГ-ММ-ДД ЧЧ:ММ');
        }
        break;
    }
  }
  
  @Action(/format_(.+)/)
  async onFormatSelect(@Ctx() ctx: BotContext) {
    if (!ctx.callbackQuery || !ctx.match) return;
    if (!ctx.session || !ctx.session.game) return;
    
    const format = ctx.match[1];
    
    ctx.session.game.data.gameMode = format;
    ctx.session.game.data.maxPlayers = format === 'ONE_ON_ONE' ? 2 : 4;
    ctx.session.game.step = 4;
    
    await ctx.editMessageText(
      'Выбран формат: ' + (format === 'ONE_ON_ONE' ? 'Одиночный (1x1)' : 'Парный (2x2)')
    );
    
    await ctx.reply('Введите дату и время проведения в формате ГГГГ-ММ-ДД ЧЧ:ММ (например, 2025-07-15 18:00)');
  }
  
  @Action(/payment_(.+)/)
  async onPaymentSelect(@Ctx() ctx: BotContext) {
    if (!ctx.callbackQuery || !ctx.match) return;
    if (!ctx.session || !ctx.session.game) return;
    
    const payment = ctx.match[1];
    
    ctx.session.game.data.paymentType = payment;
    ctx.session.game.step = 6;
    
    let paymentText;
    switch(payment) {
      case 'DIVIDED': paymentText = 'Поровну (50/50)'; break;
      case 'LOSER_PAYS': paymentText = 'Проигравший платит'; break;
      case 'HOST_PAYS': paymentText = 'Организатор платит'; break;
      case 'FREE': paymentText = 'Бесплатно'; break;
    }
    
    await ctx.editMessageText(`Выбран способ оплаты: ${paymentText}`);
    
    await ctx.reply(
      'Игра влияет на рейтинг?',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Да, рейтинговая', callback_data: 'rating_RATED' }],
            [{ text: 'Нет, без рейтинга', callback_data: 'rating_UNRATED' }],
          ]
        }
      }
    );
  }
  
  @Action(/rating_(.+)/)
  async onRatingSelect(@Ctx() ctx: BotContext) {
    if (!ctx.callbackQuery || !ctx.match) return;
    if (!ctx.session || !ctx.session.game) return;
    
    const rating = ctx.match[1];
    ctx.session.game.data.ratingType = rating;
    
    // Сохраняем заявку
    try {
      if (!ctx.callbackQuery.from) return;
      const from = ctx.callbackQuery.from;
      
      const user = await this.usersService.findByTelegramId(from.id.toString());
      
      if (user) {
        // Создаем заявку на игру
        const requestData = {
          type: RequestType.SINGLE_GAME,
          title: ctx.session.game.data.title,
          description: ctx.session.game.data.description,
          locationName: ctx.session.game.data.locationName,
          maxPlayers: ctx.session.game.data.maxPlayers,
          gameMode: ctx.session.game.data.gameMode,
          dateTime: ctx.session.game.data.dateTime,
          paymentType: ctx.session.game.data.paymentType,
          ratingType: ctx.session.game.data.ratingType,
          formatInfo: {},
        };
        
        await this.requestsService.create(user.id.toString(), requestData);
        
        let ratingText = rating === 'RATED' ? 'Рейтинговая' : 'Не рейтинговая';
        
        await ctx.reply(`
🎾 *Заявка на игру создана*
Название: ${ctx.session.game.data.title}
Место: ${ctx.session.game.data.locationName}
Формат: ${ctx.session.game.data.gameMode === 'ONE_ON_ONE' ? '1x1' : '2x2'}
Дата: ${ctx.session.game.data.dateTime.toLocaleString('ru-RU')}
Оплата: ${ctx.session.game.data.paymentType}
Тип: ${ratingText}

Ваша заявка будет видна другим игрокам в приложении.
        `, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error creating game request: ${errorMsg}`);
      await ctx.reply('Произошла ошибка при создании заявки. Пожалуйста, попробуйте позже.');
    }
    
    // Выходим из сцены
    if (ctx.scene) {
      await ctx.scene.leave();
    }
  }
}