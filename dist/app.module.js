"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const matches_module_1 = require("./modules/matches/matches.module");
const requests_module_1 = require("./modules/requests/requests.module");
const trainings_module_1 = require("./modules/trainings/trainings.module");
const tournaments_module_1 = require("./modules/tournaments/tournaments.module");
const telegram_module_1 = require("./modules/telegram/telegram.module");
const prisma_service_1 = require("./prisma/prisma.service");
const stories_module_1 = require("./modules/stories/stories.module");
const locations_module_1 = require("./modules/locations/locations.module");
const cases_module_1 = require("./modules/cases/cases.module"); // ← Добавить
const referrals_module_1 = require("./modules/referrals/referrals.module"); // ← Добавить
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            matches_module_1.MatchesModule,
            requests_module_1.RequestsModule,
            trainings_module_1.TrainingsModule,
            tournaments_module_1.TournamentsModule,
            telegram_module_1.TelegramModule,
            stories_module_1.StoriesModule,
            locations_module_1.LocationsModule,
            cases_module_1.CasesModule,
            referrals_module_1.ReferralsModule,
        ],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
exports.AppModule = AppModule;
