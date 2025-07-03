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
var MatchesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesHandler = void 0;
const common_1 = require("@nestjs/common");
const state_service_1 = require("../services/state.service");
const keyboard_service_1 = require("../services/keyboard.service");
const users_service_1 = require("../../users/application/services/users.service");
let MatchesHandler = MatchesHandler_1 = class MatchesHandler {
    constructor(stateService, keyboardService, usersService) {
        this.stateService = stateService;
        this.keyboardService = keyboardService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(MatchesHandler_1.name);
    }
    register(bot) {
        bot.action('record_match', this.handleRecordMatch.bind(this));
    }
    async handleRecordMatch(ctx) {
        try {
            await ctx.reply('📝 Запись результата матча');
        }
        catch (error) {
            this.logger.error(`Ошибка в handleRecordMatch: ${error}`);
            await ctx.reply('❌ Произошла ошибка при записи матча');
        }
    }
    async handleMatchInput(ctx, text, userId) {
        // Заглушка для обработки ввода
        return false;
    }
};
exports.MatchesHandler = MatchesHandler;
exports.MatchesHandler = MatchesHandler = MatchesHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_service_1.StateService,
        keyboard_service_1.KeyboardService,
        users_service_1.UsersService])
], MatchesHandler);
