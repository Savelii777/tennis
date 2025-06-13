"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingsModule = void 0;
const common_1 = require("@nestjs/common");
const trainings_controller_1 = require("./presentation/controllers/trainings.controller");
const trainings_service_1 = require("./application/services/trainings.service");
const trainings_repository_1 = require("./infrastructure/repositories/trainings.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_module_1 = require("../auth/auth.module"); // Add this import
let TrainingsModule = class TrainingsModule {
};
TrainingsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [trainings_controller_1.TrainingsController],
        providers: [trainings_service_1.TrainingsService, trainings_repository_1.TrainingsRepository, prisma_service_1.PrismaService],
        exports: [trainings_service_1.TrainingsService]
    })
], TrainingsModule);
exports.TrainingsModule = TrainingsModule;
