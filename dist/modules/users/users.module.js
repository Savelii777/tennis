"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./application/services/users.service");
const balls_service_1 = require("./application/services/balls.service");
const users_controller_1 = require("./presentation/controllers/users.controller");
const media_controller_1 = require("./presentation/controllers/media.controller");
const users_repository_1 = require("./infrastructure/repositories/users.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_module_1 = require("../auth/auth.module");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
        ],
        controllers: [users_controller_1.UsersController, media_controller_1.MediaController],
        providers: [users_service_1.UsersService, balls_service_1.BallsService, users_repository_1.UsersRepository, prisma_service_1.PrismaService],
        exports: [users_service_1.UsersService, balls_service_1.BallsService], // ← Оставить в exports
    })
], UsersModule);
exports.UsersModule = UsersModule;
