"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsModule = void 0;
const common_1 = require("@nestjs/common"); // Добавляем импорт forwardRef
const referrals_controller_1 = require("./presentation/controllers/referrals.controller");
const referrals_service_1 = require("./application/services/referrals.service");
const referral_stats_service_1 = require("./application/services/referral-stats.service");
const referrals_repository_1 = require("./infrastructure/repositories/referrals.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module"); // Добавляем при необходимости
let ReferralsModule = class ReferralsModule {
};
exports.ReferralsModule = ReferralsModule;
exports.ReferralsModule = ReferralsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule), // Оборачиваем в forwardRef
            (0, common_1.forwardRef)(() => users_module_1.UsersModule), // Добавляем при необходимости
        ],
        controllers: [referrals_controller_1.ReferralsController],
        providers: [
            referrals_service_1.ReferralsService,
            referral_stats_service_1.ReferralStatsService,
            referrals_repository_1.ReferralsRepository,
            prisma_service_1.PrismaService,
        ],
        exports: [referrals_service_1.ReferralsService, referral_stats_service_1.ReferralStatsService],
    })
], ReferralsModule);
