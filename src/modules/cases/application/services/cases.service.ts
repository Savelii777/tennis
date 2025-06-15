import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CasesRepository } from '../../infrastructure/repositories/cases.repository';
import { CreateCaseDto, UpdateCaseDto } from '../../presentation/dto/case.dto';

@Injectable()
export class CasesService {
  constructor(private readonly casesRepository: CasesRepository) {}

  async createCase(createCaseDto: CreateCaseDto) {
    return this.casesRepository.create(createCaseDto);
  }

  async getAllCases(includeInactive = false) {
    return this.casesRepository.findAll(includeInactive);
  }

  async getCaseById(id: number) {
    const caseData = await this.casesRepository.findById(id);
    if (!caseData) {
      throw new NotFoundException(`Кейс с ID ${id} не найден`);
    }
    return caseData;
  }

  async updateCase(id: number, updateCaseDto: UpdateCaseDto) {
    const existingCase = await this.getCaseById(id);
    return this.casesRepository.update(id, updateCaseDto);
  }

  async deleteCase(id: number) {
    const existingCase = await this.getCaseById(id);
    return this.casesRepository.delete(id);
  }

  async toggleCaseStatus(id: number) {
    const caseData = await this.getCaseById(id);
    return this.casesRepository.update(id, { isActive: !caseData.isActive });
  }

  async getCaseStatistics(id: number) {
    return this.casesRepository.getCaseStatistics(id);
  }

  async getAllCasesStatistics() {
    return this.casesRepository.getAllCasesStatistics();
  }
}