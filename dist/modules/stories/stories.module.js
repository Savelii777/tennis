"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stories_controller_1 = require("./presentation/controllers/stories.controller");
const stories_service_1 = require("./application/services/stories.service");
const stories_repository_1 = require("./infrastructure/repositories/stories.repository");
const telegram_file_service_1 = require("./infrastructure/external/telegram-file.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_module_1 = require("../auth/auth.module");
const telegram_module_1 = require("../telegram/telegram.module");
let StoriesModule = class StoriesModule {
};
StoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => telegram_module_1.TelegramModule),
        ],
        controllers: [stories_controller_1.StoriesController],
        providers: [
            stories_service_1.StoriesService,
            stories_repository_1.StoriesRepository,
            telegram_file_service_1.TelegramFileService,
            prisma_service_1.PrismaService,
        ],
        exports: [
            stories_service_1.StoriesService,
            stories_repository_1.StoriesRepository,
            telegram_file_service_1.TelegramFileService,
        ],
    })
], StoriesModule);
exports.StoriesModule = StoriesModule;
