"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesModule = void 0;
const common_1 = require("@nestjs/common");
const matches_controller_1 = require("./presentation/controllers/matches.controller");
const matches_service_1 = require("./application/services/matches.service");
const matches_repository_1 = require("./infrastructure/repositories/matches.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const achievements_module_1 = require("../achievements/achievements.module");
const ratings_module_1 = require("../ratings/ratings.module"); // Добавляем
let MatchesModule = class MatchesModule {
};
MatchesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => achievements_module_1.AchievementsModule),
            (0, common_1.forwardRef)(() => ratings_module_1.RatingsModule), // Добавляем
        ],
        controllers: [matches_controller_1.MatchesController],
        providers: [
            matches_service_1.MatchesService,
            matches_repository_1.MatchesRepository,
            prisma_service_1.PrismaService,
        ],
        exports: [matches_service_1.MatchesService],
    })
], MatchesModule);
exports.MatchesModule = MatchesModule;
