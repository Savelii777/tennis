"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsModule = void 0;
const common_1 = require("@nestjs/common");
const tournaments_controller_1 = require("./presentation/controllers/tournaments.controller");
const tournaments_service_1 = require("./application/services/tournaments.service");
const tournaments_repository_1 = require("./infrastructure/repositories/tournaments.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module"); // Add this import
let TournamentsModule = class TournamentsModule {
};
TournamentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            auth_module_1.AuthModule, // Import AuthModule to get access to JwtService
        ],
        controllers: [tournaments_controller_1.TournamentsController],
        providers: [tournaments_service_1.TournamentsService, tournaments_repository_1.TournamentsRepository, prisma_service_1.PrismaService],
        exports: [tournaments_service_1.TournamentsService],
    })
], TournamentsModule);
exports.TournamentsModule = TournamentsModule;
