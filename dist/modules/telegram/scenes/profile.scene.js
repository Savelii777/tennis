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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const users_service_1 = require("../../users/application/services/users.service");
const sport_type_enum_1 = require("../../users/domain/enums/sport-type.enum");
let ProfileScene = class ProfileScene {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async enter(ctx) {
        await ctx.reply('Заполним ваш профиль. Как вас зовут? (Имя и Фамилия)');
    }
    async onText(ctx) {
        if (!ctx.message || !('text' in ctx.message))
            return;
        if (!ctx.session) {
            ctx.session = {};
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
                await ctx.reply('Какой у вас уровень игры?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Новичок (1.0-2.0)', callback_data: 'level_beginner' }],
                            [{ text: 'Любитель (2.5-3.5)', callback_data: 'level_amateur' }],
                            [{ text: 'Уверенный игрок (4.0-4.5)', callback_data: 'level_confident' }],
                            [{ text: 'Турнирный уровень (5.0-6.0)', callback_data: 'level_tournament' }],
                            [{ text: 'Полупрофи / тренер', callback_data: 'level_semipro' }],
                        ]
                    }
                });
                break;
        }
    }
    async onLevelSelect(ctx) {
        if (!ctx.callbackQuery)
            return;
        if (!ctx.match)
            return;
        if (!ctx.session) {
            ctx.session = {};
        }
        const level = ctx.match[1];
        ctx.session.profile.selfAssessedLevel = level;
        let selfAssessedLevel;
        switch (level) {
            case 'beginner':
                selfAssessedLevel = 'BEGINNER';
                break;
            case 'amateur':
                selfAssessedLevel = 'AMATEUR';
                break;
            case 'confident':
                selfAssessedLevel = 'CONFIDENT';
                break;
            case 'tournament':
                selfAssessedLevel = 'TOURNAMENT';
                break;
            case 'semipro':
                selfAssessedLevel = 'SEMI_PRO';
                break;
        }
        // Сохраняем данные профиля
        try {
            if (!ctx.callbackQuery.from)
                return;
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
                    sportType: sport_type_enum_1.SportType.TENNIS // Use enum instead of string
                });
                // Заполняем второй шаг с базовыми данными
                await this.usersService.completeProfileStepTwo(user.id.toString(), {
                    selfAssessedLevel,
                });
                await ctx.reply('Профиль успешно заполнен! Теперь вы можете искать партнеров для игры и участвовать в турнирах.');
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`Error saving profile: ${errorMsg}`);
            await ctx.reply('Произошла ошибка при сохранении профиля. Пожалуйста, попробуйте позже.');
        }
        // Выходим из сцены
        if (ctx.scene) {
            await ctx.scene.leave();
        }
    }
};
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "enter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/level_(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileScene.prototype, "onLevelSelect", null);
ProfileScene = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('profile-setup'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ProfileScene);
exports.ProfileScene = ProfileScene;
