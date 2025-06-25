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
var BaseBotHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBotHandler = void 0;
// src/modules/telegram/handlers/base-bot.handler.ts
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/application/services/users.service");
const balls_service_1 = require("../../users/application/services/balls.service");
const profile_state_enum_1 = require("../interfaces/profile-state.enum");
let BaseBotHandler = BaseBotHandler_1 = class BaseBotHandler {
    constructor(usersService, ballsService) {
        this.usersService = usersService;
        this.ballsService = ballsService;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    getUserState(userId) {
        return BaseBotHandler_1.userStates.get(userId) || { step: profile_state_enum_1.ProfileStep.IDLE, data: {} };
    }
    setUserState(userId, state) {
        BaseBotHandler_1.userStates.set(userId, state);
    }
    clearUserState(userId) {
        BaseBotHandler_1.userStates.delete(userId);
    }
    async getUser(ctx) {
        if (!ctx.from)
            return null;
        return await this.usersService.findByTelegramId(ctx.from.id.toString());
    }
};
// Храним состояния пользователей в памяти (в продакшене лучше использовать Redis)
BaseBotHandler.userStates = new Map();
BaseBotHandler = BaseBotHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        balls_service_1.BallsService])
], BaseBotHandler);
exports.BaseBotHandler = BaseBotHandler;
