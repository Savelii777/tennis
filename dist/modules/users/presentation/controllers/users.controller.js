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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../../application/services/users.service");
const auth_guard_1 = require("../../../../common/guards/auth.guard");
const update_profile_dto_1 = require("../dto/update-profile.dto");
const profile_step_one_dto_1 = require("../dto/profile-step-one.dto");
const profile_step_two_dto_1 = require("../dto/profile-step-two.dto");
const send_message_dto_1 = require("../../domain/dto/send-message.dto");
const invite_to_game_dto_1 = require("../../domain/dto/invite-to-game.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const update_location_dto_1 = require("../dto/update-location.dto");
// Импортируйте сервисы для матчей, турниров и историй
const matches_service_1 = require("../../../matches/application/services/matches.service");
const tournaments_service_1 = require("../../../tournaments/application/services/tournaments.service");
const stories_service_1 = require("../../../stories/application/services/stories.service");
let UsersController = class UsersController {
    constructor(usersService, matchesService, tournamentsService, storiesService) {
        this.usersService = usersService;
        this.matchesService = matchesService;
        this.tournamentsService = tournamentsService;
        this.storiesService = storiesService;
    }
    async getMe(req) {
        const userId = req.user.id.toString();
        // Получаем полный профиль со всеми связанными данными
        const userProfile = await this.usersService.getUserFullProfile(userId);
        // Получаем последние матчи
        const recentMatches = await this.matchesService.getUserRecentMatches(userId, 5);
        // Получаем активные турниры
        const tournaments = await this.tournamentsService.getUserTournaments(userId);
        // Получаем истории/фото
        const stories = await this.storiesService.getUserStories(userId);
        // Получаем достижения
        const achievements = await this.usersService.getUserAchievements(userId);
        // Формируем полный ответ в соответствии с ТЗ
        return {
            ...userProfile,
            recentMatches,
            tournaments,
            stories,
            achievements
        };
    }
    async getUserById(req, id) {
        const requesterId = req.user.id.toString();
        const targetId = id;
        // Проверяем свой ли это профиль
        const isOwnProfile = requesterId === targetId;
        if (isOwnProfile) {
            // Если свой профиль - возвращаем полные данные
            return this.getMe(req);
        }
        // Если чужой профиль - получаем с учетом настроек приватности
        return this.usersService.getPublicUserProfile(targetId, requesterId);
    }
    async updateProfile(req, updateProfileDto) {
        return this.usersService.updateProfile(req.user.id.toString(), updateProfileDto);
    }
    async uploadAvatar(req, file) {
        if (!file) {
            throw new Error('Файл не найден');
        }
        return this.usersService.updateAvatar(req.user.id.toString(), file.filename);
    }
    async getMyMatches(req, status, limit, offset) {
        return this.matchesService.getUserMatches(req.user.id.toString(), {
            status,
            limit: limit ? parseInt(limit) : 20,
            offset: offset ? parseInt(offset) : 0
        });
    }
    async getMyTournaments(req, status) {
        return this.tournamentsService.getUserTournaments(req.user.id.toString(), { status });
    }
    async getMyStories(req) {
        return this.storiesService.getUserStories(req.user.id.toString());
    }
    async generateShareLink(req) {
        const userId = req.user.id.toString();
        const shareUrl = await this.usersService.generateProfileShareUrl(userId);
        return {
            shareUrl,
            deepLink: `tennis-app://profile/${userId}`,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`
        };
    }
    // Отправка сообщения пользователю (через бота)
    async sendMessage(req, recipientId, messageDto) {
        return this.usersService.sendDirectMessage(req.user.id.toString(), recipientId, messageDto.message);
    }
    // Пригласить пользователя в игру
    async inviteToGame(req, targetId, inviteDto) {
        return this.matchesService.inviteToMatch(req.user.id.toString(), targetId, inviteDto);
    }
    // Существующие методы для пошагового заполнения профиля
    async completeProfileStepOne(req, profileData) {
        return this.usersService.completeProfileStepOne(req.user.id.toString(), profileData);
    }
    async completeProfileStepTwo(req, profileData) {
        return this.usersService.completeProfileStepTwo(req.user.id.toString(), profileData);
    }
    async getProfileStatus(req) {
        return this.usersService.getProfileCompletionStatus(req.user.id.toString());
    }
    // Существующие методы для управления локацией
    async updateMyLocation(req, updateLocationDto) {
        const userId = req.user.id.toString();
        return this.usersService.updateUserLocation(userId, updateLocationDto);
    }
    async getMyLocation(req) {
        const userId = req.user.id.toString();
        return this.usersService.getUserWithLocation(userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить полный профиль текущего пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Профиль успешно получен' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить публичный профиль пользователя' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Профиль успешно получен' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Профиль приватный' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Пользователь не найден' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить профиль пользователя' }),
    (0, swagger_1.ApiBody)({ type: update_profile_dto_1.UpdateProfileDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Профиль обновлен' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const filename = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, filename);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Только изображения разрешены'), false);
            }
            cb(null, true);
        },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Загрузить аватар' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Аватар загружен' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('me/matches'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить матчи пользователя' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'FINISHED', 'CANCELLED'] }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Количество записей' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Смещение' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список матчей' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyMatches", null);
__decorate([
    (0, common_1.Get)('me/tournaments'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить турниры пользователя' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['UPCOMING', 'ACTIVE', 'FINISHED'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список турниров' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyTournaments", null);
__decorate([
    (0, common_1.Get)('me/stories'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить истории/фото пользователя' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Список историй' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyStories", null);
__decorate([
    (0, common_1.Post)('me/share'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Сгенерировать ссылку для шаринга профиля' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ссылка создана' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "generateShareLink", null);
__decorate([
    (0, common_1.Post)(':id/message'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Отправить сообщение пользователю' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID получателя' }),
    (0, swagger_1.ApiBody)({ type: send_message_dto_1.SendMessageDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Сообщение отправлено' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Пользователь не принимает сообщения' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Пригласить пользователя в игру' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID приглашаемого' }),
    (0, swagger_1.ApiBody)({ type: invite_to_game_dto_1.InviteToGameDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Приглашение отправлено' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, invite_to_game_dto_1.InviteToGameDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "inviteToGame", null);
__decorate([
    (0, common_1.Post)('/me/profile/step-one'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Заполнить первый шаг профиля' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_step_one_dto_1.ProfileStepOneDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "completeProfileStepOne", null);
__decorate([
    (0, common_1.Post)('/me/profile/step-two'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Заполнить второй шаг профиля' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_step_two_dto_1.ProfileStepTwoDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "completeProfileStepTwo", null);
__decorate([
    (0, common_1.Get)('/me/profile/status'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить статус заполнения профиля' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfileStatus", null);
__decorate([
    (0, common_1.Patch)('me/location'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить локацию пользователя',
        description: 'Обновляет страну, город и вид спорта пользователя'
    }),
    (0, swagger_1.ApiBody)({ type: update_location_dto_1.UpdateLocationDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_location_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyLocation", null);
__decorate([
    (0, common_1.Get)('me/location'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить локацию пользователя',
        description: 'Возвращает информацию о стране, городе и виде спорта'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyLocation", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        matches_service_1.MatchesService,
        tournaments_service_1.TournamentsService,
        stories_service_1.StoriesService])
], UsersController);
