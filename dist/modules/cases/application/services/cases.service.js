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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesService = void 0;
const common_1 = require("@nestjs/common");
const cases_repository_1 = require("../../infrastructure/repositories/cases.repository");
let CasesService = class CasesService {
    constructor(casesRepository) {
        this.casesRepository = casesRepository;
    }
    async createCase(createCaseDto) {
        return this.casesRepository.create(createCaseDto);
    }
    async getAllCases(includeInactive = false) {
        return this.casesRepository.findAll(includeInactive);
    }
    async getCaseById(id) {
        const caseData = await this.casesRepository.findById(id);
        if (!caseData) {
            throw new common_1.NotFoundException(`Кейс с ID ${id} не найден`);
        }
        return caseData;
    }
    async updateCase(id, updateCaseDto) {
        const existingCase = await this.getCaseById(id);
        return this.casesRepository.update(id, updateCaseDto);
    }
    async deleteCase(id) {
        const existingCase = await this.getCaseById(id);
        return this.casesRepository.delete(id);
    }
    async toggleCaseStatus(id) {
        const caseData = await this.getCaseById(id);
        return this.casesRepository.update(id, { isActive: !caseData.isActive });
    }
    async getCaseStatistics(id) {
        return this.casesRepository.getCaseStatistics(id);
    }
    async getAllCasesStatistics() {
        return this.casesRepository.getAllCasesStatistics();
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cases_repository_1.CasesRepository])
], CasesService);
