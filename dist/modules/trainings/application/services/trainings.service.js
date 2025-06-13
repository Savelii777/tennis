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
exports.TrainingsService = void 0;
const common_1 = require("@nestjs/common");
const trainings_repository_1 = require("../../infrastructure/repositories/trainings.repository");
const training_type_enum_1 = require("../../domain/enums/training-type.enum");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let TrainingsService = class TrainingsService {
    constructor(trainingsRepository, prisma) {
        this.trainingsRepository = trainingsRepository;
        this.prisma = prisma;
    }
    async findAll(filters) {
        return this.trainingsRepository.findAll(filters);
    }
    async findById(id) {
        const training = await this.trainingsRepository.findById(id);
        if (!training) {
            throw new common_1.NotFoundException(`Training session with ID ${id} not found`);
        }
        return training;
    }
    async create(userId, createTrainingDto) {
        // Проверка, что дата окончания позже даты начала
        if (createTrainingDto.endTime <= createTrainingDto.dateTime) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        return this.trainingsRepository.create(userId, createTrainingDto);
    }
    async bookSlot(trainingId, userId) {
        const training = await this.findById(trainingId);
        // Нельзя бронировать слот в закрытой или завершенной тренировке
        if (training.status !== training_type_enum_1.TrainingState.OPEN) {
            throw new common_1.BadRequestException('This training session is not open for bookings');
        }
        // Проверка на наличие свободных слотов
        if (training.currentSlots >= training.maxSlots) {
            throw new common_1.ConflictException('This training session is full');
        }
        // Проверка, что пользователь еще не участвует
        const isParticipant = await this.trainingsRepository.isParticipant(trainingId, userId);
        if (isParticipant) {
            throw new common_1.BadRequestException('You are already booked for this training session');
        }
        return this.trainingsRepository.bookSlot(trainingId, userId);
    }
    async cancelBooking(trainingId, userId) {
        const training = await this.findById(trainingId);
        // Если пользователь создатель, он не может отменить свое участие
        if (training.creatorId === parseInt(userId)) {
            throw new common_1.BadRequestException('As the creator, you cannot cancel your participation');
        }
        // Проверка, что пользователь участвует
        const isParticipant = await this.trainingsRepository.isParticipant(trainingId, userId);
        if (!isParticipant) {
            throw new common_1.BadRequestException('You are not a participant of this training session');
        }
        return this.trainingsRepository.cancelBooking(trainingId, userId);
    }
    async cancelTraining(trainingId, userId) {
        const training = await this.findById(trainingId);
        // Только создатель может отменить тренировку
        if (training.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('Only the creator can cancel a training session');
        }
        // Нельзя отменить уже завершенную тренировку
        if (training.status === training_type_enum_1.TrainingState.DONE) {
            throw new common_1.BadRequestException('Cannot cancel a completed training session');
        }
        return this.trainingsRepository.cancelTraining(trainingId, userId);
    }
};
TrainingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trainings_repository_1.TrainingsRepository,
        prisma_service_1.PrismaService])
], TrainingsService);
exports.TrainingsService = TrainingsService;
