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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProfileScene_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const users_service_1 = require("../../users/application/services/users.service");
const sport_type_enum_1 = require("../../users/domain/enums/sport-type.enum");
let ProfileScene = ProfileScene_1 = class ProfileScene {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(ProfileScene_1.name);
        this.logger.log('ProfileScene constructor called');
    }
    async onSceneEnter(ctx) {
        this.logger.log('=== ENTERING PROFILE SCENE ===');
        this.logger.log(`User ID: ${ctx.from?.id}`);
        this.logger.log(`Scene context available: ${!!ctx.scene}`);
        this.logger.log(`Session available: ${!!ctx.session}`);
        try {
            // Инициализируем сессию если её нет
            if (!ctx.session) {
                this.logger.log('Initializing session');
                ctx.session = {};
            }
            // Инициализируем данные профиля
            ctx.session.profile = {
                step: 0,
                data: {}
            };
            this.logger.log('Session profile initialized');
            await ctx.reply(`👋 *Настройка профиля*

Давайте заполним ваш профиль для лучшего подбора партнёров!

*Шаг 1 из 7: Основная информация*

Как вас зовут? Введите ваше имя:`, { parse_mode: 'Markdown' });
            this.logger.log('Welcome message sent successfully');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in onSceneEnter: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при входе в настройку профиля. Попробуйте позже.');
        }
    }
    async onText(ctx) {
        this.logger.log('=== TEXT MESSAGE RECEIVED ===');
        if (!ctx.message || !('text' in ctx.message)) {
            this.logger.warn('No text in message');
            return;
        }
        if (!ctx.session?.profile) {
            this.logger.error('No profile session data');
            await ctx.reply('Ошибка сессии. Перезапустите настройку профиля командой /start');
            return;
        }
        const text = ctx.message.text;
        const step = ctx.session.profile.step;
        this.logger.log(`Current step: ${step}, Text: "${text}"`);
        try {
            switch (step) {
                case 0: // Имя
                    await this.handleFirstName(ctx, text);
                    break;
                case 1: // Фамилия
                    await this.handleLastName(ctx, text);
                    break;
                case 2: // Город
                    await this.handleCity(ctx, text);
                    break;
                case 3: // Предпочитаемый корт
                    await this.handlePreferredCourt(ctx, text);
                    break;
                default:
                    this.logger.warn(`Unknown step: ${step}`);
                    await ctx.reply('Неизвестный шаг. Попробуйте перезапустить настройку.');
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error handling text at step ${step}: ${errorMsg}`);
            await ctx.reply('Произошла ошибка. Попробуйте еще раз.');
        }
    }
    async handleFirstName(ctx, firstName) {
        this.logger.log(`Handling first name: ${firstName}`);
        if (firstName.length < 2 || firstName.length > 50) {
            await ctx.reply('Имя должно содержать от 2 до 50 символов. Попробуйте еще раз:');
            return;
        }
        ctx.session.profile.data.firstName = firstName;
        ctx.session.profile.step = 1;
        this.logger.log('First name saved, moving to step 1');
        await ctx.reply('Отлично! Теперь введите вашу фамилию:');
    }
    async handleLastName(ctx, lastName) {
        this.logger.log(`Handling last name: ${lastName}`);
        if (lastName.length < 2 || lastName.length > 50) {
            await ctx.reply('Фамилия должна содержать от 2 до 50 символов. Попробуйте еще раз:');
            return;
        }
        ctx.session.profile.data.lastName = lastName;
        ctx.session.profile.step = 2;
        this.logger.log('Last name saved, moving to step 2');
        await ctx.reply('Хорошо! В каком городе вы играете в теннис?');
    }
    async handleCity(ctx, city) {
        this.logger.log(`Handling city: ${city}`);
        if (city.length < 2 || city.length > 100) {
            await ctx.reply('Название города должно содержать от 2 до 100 символов. Попробуйте еще раз:');
            return;
        }
        ctx.session.profile.data.city = city;
        ctx.session.profile.step = 3;
        this.logger.log('City saved, moving to step 3');
        await ctx.reply('Отлично! Укажите ваш предпочитаемый корт или напишите "любой":');
    }
    async handlePreferredCourt(ctx, court) {
        this.logger.log(`Handling preferred court: ${court}`);
        ctx.session.profile.data.preferredCourt = court === 'любой' ? null : court;
        ctx.session.profile.step = 4;
        this.logger.log('Preferred court saved, showing dominant hand selection');
        await ctx.reply('Укажите вашу игровую руку:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🤚 Правша', callback_data: 'hand_RIGHT' }],
                    [{ text: '🤚 Левша', callback_data: 'hand_LEFT' }],
                ]
            }
        });
    }
    async onHandSelect(ctx) {
        this.logger.log('=== HAND SELECTION ===');
        if (!ctx.callbackQuery || !ctx.match) {
            this.logger.warn('No callback query or match');
            return;
        }
        if (!ctx.session?.profile) {
            this.logger.error('No profile session data in hand select');
            await ctx.answerCbQuery('Ошибка сессии');
            return;
        }
        const hand = ctx.match[1];
        this.logger.log(`Selected hand: ${hand}`);
        try {
            ctx.session.profile.data.dominantHand = hand;
            ctx.session.profile.step = 5;
            await ctx.answerCbQuery();
            await ctx.editMessageText(`Выбрана игровая рука: ${hand === 'RIGHT' ? 'Правша' : 'Левша'}`);
            await ctx.reply('Как часто вы играете в теннис в неделю?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '1 раз', callback_data: 'frequency_ONE' }],
                        [{ text: '2-3 раза', callback_data: 'frequency_TWO_THREE' }],
                        [{ text: '4+ раз', callback_data: 'frequency_FOUR_PLUS' }],
                    ]
                }
            });
            this.logger.log('Hand selection completed, showing frequency options');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in onHandSelect: ${errorMsg}`);
            await ctx.answerCbQuery('Произошла ошибка');
        }
    }
    async onFrequencySelect(ctx) {
        this.logger.log('=== FREQUENCY SELECTION ===');
        if (!ctx.callbackQuery || !ctx.match) {
            this.logger.warn('No callback query or match');
            return;
        }
        if (!ctx.session?.profile) {
            this.logger.error('No profile session data in frequency select');
            await ctx.answerCbQuery('Ошибка сессии');
            return;
        }
        const frequency = ctx.match[1];
        this.logger.log(`Selected frequency: ${frequency}`);
        try {
            ctx.session.profile.data.weeklyPlayFrequency = frequency;
            ctx.session.profile.step = 6;
            let frequencyText;
            switch (frequency) {
                case 'ONE':
                    frequencyText = '1 раз в неделю';
                    break;
                case 'TWO_THREE':
                    frequencyText = '2-3 раза в неделю';
                    break;
                case 'FOUR_PLUS':
                    frequencyText = '4+ раз в неделю';
                    break;
                default: frequencyText = frequency;
            }
            await ctx.answerCbQuery();
            await ctx.editMessageText(`Частота игры: ${frequencyText}`);
            await ctx.reply('Участвуете ли вы в турнирах?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Да, участвую', callback_data: 'tournaments_true' }],
                        [{ text: '❌ Нет, не участвую', callback_data: 'tournaments_false' }],
                    ]
                }
            });
            this.logger.log('Frequency selection completed, showing tournament options');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in onFrequencySelect: ${errorMsg}`);
            await ctx.answerCbQuery('Произошла ошибка');
        }
    }
    async onTournamentsSelect(ctx) {
        this.logger.log('=== TOURNAMENTS SELECTION ===');
        if (!ctx.callbackQuery || !ctx.match) {
            this.logger.warn('No callback query or match');
            return;
        }
        if (!ctx.session?.profile) {
            this.logger.error('No profile session data in tournaments select');
            await ctx.answerCbQuery('Ошибка сессии');
            return;
        }
        const participates = ctx.match[1] === 'true';
        this.logger.log(`Participates in tournaments: ${participates}`);
        try {
            ctx.session.profile.data.playsInTournaments = participates;
            ctx.session.profile.step = 7;
            await ctx.answerCbQuery();
            await ctx.editMessageText(`Участие в турнирах: ${participates ? 'Да' : 'Нет'}`);
            await ctx.reply('Оцените ваш уровень игры:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🟢 Новичок', callback_data: 'level_BEGINNER' }],
                        [{ text: '🟡 Любитель', callback_data: 'level_AMATEUR' }],
                        [{ text: '🟠 Уверенный', callback_data: 'level_CONFIDENT' }],
                        [{ text: '🔴 Турнирный', callback_data: 'level_TOURNAMENT' }],
                        [{ text: '⚫ Полупрофессиональный', callback_data: 'level_SEMI_PRO' }],
                    ]
                }
            });
            this.logger.log('Tournaments selection completed, showing level options');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in onTournamentsSelect: ${errorMsg}`);
            await ctx.answerCbQuery('Произошла ошибка');
        }
    }
    async onLevelSelect(ctx) {
        this.logger.log('=== LEVEL SELECTION AND PROFILE COMPLETION ===');
        if (!ctx.callbackQuery || !ctx.match) {
            this.logger.warn('No callback query or match');
            return;
        }
        if (!ctx.session?.profile) {
            this.logger.error('No profile session data in level select');
            await ctx.answerCbQuery('Ошибка сессии');
            return;
        }
        const level = ctx.match[1];
        this.logger.log(`Selected level: ${level}`);
        try {
            ctx.session.profile.data.selfAssessedLevel = level;
            let levelText;
            switch (level) {
                case 'BEGINNER':
                    levelText = 'Новичок';
                    break;
                case 'AMATEUR':
                    levelText = 'Любитель';
                    break;
                case 'CONFIDENT':
                    levelText = 'Уверенный';
                    break;
                case 'TOURNAMENT':
                    levelText = 'Турнирный';
                    break;
                case 'SEMI_PRO':
                    levelText = 'Полупрофессиональный';
                    break;
                default: levelText = level;
            }
            await ctx.answerCbQuery();
            await ctx.editMessageText(`Уровень игры: ${levelText}`);
            // Сохраняем профиль
            await this.saveProfile(ctx);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error in onLevelSelect: ${errorMsg}`);
            await ctx.answerCbQuery('Произошла ошибка');
        }
    }
    async saveProfile(ctx) {
        this.logger.log('=== SAVING PROFILE ===');
        try {
            if (!ctx.from) {
                this.logger.error('No user from data');
                await ctx.reply('Ошибка: не удалось определить пользователя');
                return;
            }
            const user = await this.usersService.findByTelegramId(ctx.from.id.toString());
            if (!user) {
                this.logger.error('User not found in database');
                await ctx.reply('Ошибка: пользователь не найден в базе данных');
                return;
            }
            const profileData = ctx.session.profile.data;
            this.logger.log('Profile data to save:', JSON.stringify(profileData, null, 2));
            // Сохраняем первый шаг профиля
            const stepOneData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                city: profileData.city,
                preferredCourt: profileData.preferredCourt,
                dominantHand: profileData.dominantHand,
                preferredPlayTime: ['EVENING'],
                playsInTournaments: profileData.playsInTournaments,
                weeklyPlayFrequency: profileData.weeklyPlayFrequency,
                sportType: sport_type_enum_1.SportType.TENNIS
            };
            this.logger.log('Calling completeProfileStepOne...');
            await this.usersService.completeProfileStepOne(user.id.toString(), stepOneData);
            // Сохраняем второй шаг профиля
            const stepTwoData = {
                selfAssessedLevel: profileData.selfAssessedLevel,
                ntrpRating: 3.0,
                backhandType: 'TWO_HANDED',
                preferredSurface: 'HARD',
                playingStyle: 'UNIVERSAL',
                favoriteShot: 'FOREHAND',
                opponentPreference: 'ANY' // Значение по умолчанию
            };
            this.logger.log('Calling completeProfileStepTwo...');
            await this.usersService.completeProfileStepTwo(user.id.toString(), stepTwoData);
            this.logger.log('Profile saved successfully');
            await ctx.reply(`✅ *Профиль успешно настроен!*

👤 **Ваши данные:**
Имя: ${profileData.firstName} ${profileData.lastName}
Город: ${profileData.city}
Корт: ${profileData.preferredCourt || 'Любой'}
Игровая рука: ${profileData.dominantHand === 'RIGHT' ? 'Правша' : 'Левша'}
Частота игры: ${this.getFrequencyText(profileData.weeklyPlayFrequency)}
Турниры: ${profileData.playsInTournaments ? 'Участвую' : 'Не участвую'}
Уровень: ${this.getLevelText(profileData.selfAssessedLevel)}

Теперь вы можете искать партнёров для игры! 🎾`, { parse_mode: 'Markdown' });
            // Очищаем данные сессии и выходим из сцены
            if (ctx.session?.profile) {
                delete ctx.session.profile;
            }
            this.logger.log('Leaving profile scene');
            await ctx.scene.leave();
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error saving profile: ${errorMsg}`);
            await ctx.reply('❌ Произошла ошибка при сохранении профиля. Попробуйте позже.');
        }
    }
    getFrequencyText(frequency) {
        switch (frequency) {
            case 'ONE': return '1 раз в неделю';
            case 'TWO_THREE': return '2-3 раза в неделю';
            case 'FOUR_PLUS': return '4+ раз в неделю';
            default: return frequency;
        }
    }
    getLevelText(level) {
        switch (level) {
            case 'BEGINNER': return 'Новичок';
            case 'AMATEUR': return 'Любитель';
            case 'CONFIDENT': return 'Уверенный';
            case 'TOURNAMENT': return 'Турнирный';
            case 'SEMI_PRO': return 'Полупрофессиональный';
            default: return level;
        }
    }
    async onUnhandledCallback(ctx) {
        this.logger.warn('Unhandled callback query in profile scene');
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('Неизвестная команда');
        }
    }
};
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onSceneEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/hand_(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onHandSelect", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/frequency_(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onFrequencySelect", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/tournaments_(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onTournamentsSelect", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/level_(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onLevelSelect", null);
__decorate([
    (0, nestjs_telegraf_1.On)('callback_query'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onUnhandledCallback", null);
ProfileScene = ProfileScene_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('profile-setup'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ProfileScene);
exports.ProfileScene = ProfileScene;
