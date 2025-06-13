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
const roles_guard_1 = require("../../../../common/guards/roles.guard");
const update_profile_dto_1 = require("../dto/update-profile.dto");
const profile_step_one_dto_1 = require("../dto/profile-step-one.dto");
const profile_step_two_dto_1 = require("../dto/profile-step-two.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getMe(req) {
        return this.usersService.findById(req.user.id.toString());
    }
    async updateProfile(req, updateProfileDto) {
        return this.usersService.updateProfile(req.user.id.toString(), updateProfileDto);
    }
    async getMyStatistics(req) {
        return this.usersService.getProfileStatistics(req.user.id.toString());
    }
    async getMyAchievements(req) {
        return this.usersService.getUserAchievements(req.user.id.toString());
    }
    async getMyRatingHistory(req) {
        return this.usersService.getRatingHistory(req.user.id.toString());
    }
    async getUserById(req, id) {
        const user = await this.usersService.findById(id);
        if (req.user.id !== parseInt(id) && !user.profile.is_public_profile) {
            throw new common_1.ForbiddenException('This profile is private');
        }
        return user;
    }
    async getUserStatistics(req, id) {
        const user = await this.usersService.findById(id);
        if (req.user.id !== parseInt(id) && !user.profile.is_public_profile) {
            throw new common_1.ForbiddenException('This profile is private');
        }
        return this.usersService.getProfileStatistics(id);
    }
    async inviteToMatch(req, id) {
        return { message: 'Invitation sent' };
    }
    async getAllUsers() {
        return this.usersService.findAll();
    }
    async completeProfileStepOne(req, profileData) {
        return this.usersService.completeProfileStepOne(req.user.id.toString(), profileData);
    }
    async completeProfileStepTwo(req, profileData) {
        return this.usersService.completeProfileStepTwo(req.user.id.toString(), profileData);
    }
    async getProfileStatus(req) {
        return this.usersService.getProfileCompletionStatus(req.user.id.toString());
    }
};
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiBody)({ type: update_profile_dto_1.UpdateProfileDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('me/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user statistics' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyStatistics", null);
__decorate([
    (0, common_1.Get)('me/achievements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user achievements' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyAchievements", null);
__decorate([
    (0, common_1.Get)('me/rating-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user rating history' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyRatingHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStatistics", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite user to a match' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID to invite' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "inviteToMatch", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
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
UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
