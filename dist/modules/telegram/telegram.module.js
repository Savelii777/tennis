"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const config_1 = require("@nestjs/config");
const telegram_service_1 = require("./telegram.service");
const telegram_controller_1 = require("./telegram.controller");
const bot_service_1 = require("./bot.service");
const profile_scene_1 = require("./scenes/profile.scene");
const game_scene_1 = require("./scenes/game.scene");
const training_scene_1 = require("./scenes/training.scene");
const tournament_scene_1 = require("./scenes/tournament.scene");
const results_scene_1 = require("./scenes/results.scene");
const stories_scene_1 = require("./scenes/stories.scene");
const case_scene_1 = require("./scenes/case.scene");
const telegraf_1 = require("telegraf");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");
const requests_module_1 = require("../requests/requests.module");
const trainings_module_1 = require("../trainings/trainings.module");
const tournaments_module_1 = require("../tournaments/tournaments.module");
let TelegramModule = class TelegramModule {
};
TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const token = configService.get('TELEGRAM_BOT_TOKEN');
                    if (!token) {
                        throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
                    }
                    // Correct configuration for TelegrafModule
                    const options = {
                        token,
                        include: [],
                        middlewares: [(0, telegraf_1.session)()],
                        launchOptions: {} // Using default options
                    };
                    return options;
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            requests_module_1.RequestsModule,
            trainings_module_1.TrainingsModule,
            tournaments_module_1.TournamentsModule,
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [
            telegram_service_1.TelegramService,
            bot_service_1.BotService,
            profile_scene_1.ProfileScene,
            game_scene_1.GameScene,
            training_scene_1.TrainingScene,
            tournament_scene_1.TournamentScene,
            results_scene_1.ResultsScene,
            stories_scene_1.StoriesScene,
            case_scene_1.CaseScene,
        ],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
exports.TelegramModule = TelegramModule;
