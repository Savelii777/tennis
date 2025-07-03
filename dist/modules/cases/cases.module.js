"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesModule = void 0;
const common_1 = require("@nestjs/common"); // Добавляем импорт forwardRef
const config_1 = require("@nestjs/config");
const cases_controller_1 = require("./presentation/controllers/cases.controller");
const admin_cases_controller_1 = require("./presentation/controllers/admin-cases.controller");
const cases_service_1 = require("./application/services/cases.service");
const case_items_service_1 = require("./application/services/case-items.service");
const case_opening_service_1 = require("./application/services/case-opening.service");
const cases_repository_1 = require("./infrastructure/repositories/cases.repository");
const prisma_service_1 = require("../../prisma/prisma.service");
const users_module_1 = require("../users/users.module");
const auth_module_1 = require("../auth/auth.module");
let CasesModule = class CasesModule {
};
exports.CasesModule = CasesModule;
exports.CasesModule = CasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule), // Оборачиваем в forwardRef
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule) // Оборачиваем в forwardRef
        ],
        controllers: [cases_controller_1.CasesController, admin_cases_controller_1.AdminCasesController],
        providers: [
            cases_service_1.CasesService,
            case_items_service_1.CaseItemsService,
            case_opening_service_1.CaseOpeningService,
            cases_repository_1.CasesRepository,
            prisma_service_1.PrismaService,
        ],
        exports: [cases_service_1.CasesService, case_opening_service_1.CaseOpeningService],
    })
], CasesModule);
