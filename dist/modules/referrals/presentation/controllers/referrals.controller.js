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
exports.ReferralsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const referrals_service_1 = require("../../application/services/referrals.service");
const referral_stats_service_1 = require("../../application/services/referral-stats.service");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
let ReferralsController = class ReferralsController {
    constructor(referralsService, referralStatsService) {
        this.referralsService = referralsService;
        this.referralStatsService = referralStatsService;
    }
    async generateInviteLink(req, baseUrl) {
        const defaultBaseUrl = baseUrl || `${req.protocol}://${req.get('host')}`;
        const inviteLink = await this.referralsService.generateInviteLink(req.user.id.toString(), defaultBaseUrl);
        return {
            inviteLink,
            message: 'Поделитесь этой ссылкой с друзьями!',
            shareText: 'Присоединяйся к нашему теннисному сообществу! 🎾',
        };
    }
    async validateReferralCode(code) {
        const isValid = await this.referralsService.validateReferralCode(code);
        return {
            isValid,
            message: isValid ? 'Код действителен' : 'Недействительный код',
        };
    }
    async getMyReferralStats(req) {
        return this.referralsService.getUserReferralStats(req.user.id.toString());
    }
    async getMyAchievements(req) {
        return this.referralStatsService.getUserAchievements(req.user.id.toString());
    }
    async getTopReferrers(limit) {
        const limitNum = limit ? parseInt(limit) : 10;
        return this.referralsService.getTopReferrers(limitNum);
    }
    async getGlobalStats() {
        return this.referralStatsService.getGlobalStats();
    }
    async registerByReferral(registerData, req) {
        if (!registerData.referralCode) {
            throw new common_1.BadRequestException('Отсутствует реферальный код');
        }
        const result = await this.referralsService.registerByReferral(registerData.referralCode, {
            ...registerData,
            ipAddress: req.ip,
        });
        return {
            user: result.user,
            referrer: result.referrer,
            message: `Добро пожаловать! Вас пригласил ${result.referrer.firstName}`,
        };
    }
    async markUserAsActive(userId) {
        await this.referralsService.markUserAsActive(userId);
        return { message: 'Пользователь отмечен как активный' };
    }
};
__decorate([
    (0, common_1.Post)('generate-invite'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Генерировать персональную ссылку-приглашение' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ссылка для приглашения создана' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('baseUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "generateInviteLink", null);
__decorate([
    (0, common_1.Get)('validate/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Проверить валидность реферального кода' }),
    (0, swagger_1.ApiParam)({ name: 'code', description: 'Реферальный код для проверки' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Результат проверки кода' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "validateReferralCode", null);
__decorate([
    (0, common_1.Get)('my-stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить статистику рефералов пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Статистика рефералов' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getMyReferralStats", null);
__decorate([
    (0, common_1.Get)('my-achievements'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить достижения пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Достижения за рефералов' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getMyAchievements", null);
__decorate([
    (0, common_1.Get)('top-referrers'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить топ рефереров' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Количество записей (по умолчанию 10)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список топ рефереров' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getTopReferrers", null);
__decorate([
    (0, common_1.Get)('global-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Глобальная статистика реферальной программы' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Общая статистика' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Регистрация по реферальной ссылке' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                referralCode: { type: 'string', description: 'Реферальный код' },
                telegram_id: { type: 'string', description: 'Telegram ID' },
                username: { type: 'string', description: 'Username' },
                first_name: { type: 'string', description: 'Имя' },
                last_name: { type: 'string', description: 'Фамилия' },
                photo_url: { type: 'string', description: 'URL фото' },
                source: { type: 'string', description: 'Источник перехода' },
            },
            required: ['referralCode', 'telegram_id', 'username', 'first_name'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Пользователь зарегистрирован по реферальной ссылке' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "registerByReferral", null);
__decorate([
    (0, common_1.Post)('mark-active/:userId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Отметить пользователя как активного (внутренний эндпоинт)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Пользователь отмечен как активный' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "markUserAsActive", null);
ReferralsController = __decorate([
    (0, swagger_1.ApiTags)('referrals'),
    (0, common_1.Controller)('referrals'),
    __metadata("design:paramtypes", [referrals_service_1.ReferralsService,
        referral_stats_service_1.ReferralStatsService])
], ReferralsController);
exports.ReferralsController = ReferralsController;
