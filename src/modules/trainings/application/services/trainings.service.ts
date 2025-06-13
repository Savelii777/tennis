import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { TrainingsRepository } from '../../infrastructure/repositories/trainings.repository';
import { TrainingEntity } from '../../domain/entities/training.entity';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { BookTrainingDto } from '../dto/book-training.dto';
import { TrainingState } from '../../domain/enums/training-type.enum';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(
    private readonly trainingsRepository: TrainingsRepository,
    private readonly prisma: PrismaService
  ) {}

  async findAll(filters?: any): Promise<TrainingEntity[]> {
    return this.trainingsRepository.findAll(filters);
  }

  async findById(id: string): Promise<TrainingEntity> {
    const training = await this.trainingsRepository.findById(id);
    if (!training) {
      throw new NotFoundException(`Training session with ID ${id} not found`);
    }
    return training;
  }

  async create(userId: string, createTrainingDto: CreateTrainingDto): Promise<TrainingEntity> {
    // Проверка, что дата окончания позже даты начала
    if (createTrainingDto.endTime <= createTrainingDto.dateTime) {
      throw new BadRequestException('End time must be after start time');
    }
    
    return this.trainingsRepository.create(userId, createTrainingDto);
  }

  async bookSlot(trainingId: string, userId: string): Promise<TrainingEntity> {
    const training = await this.findById(trainingId);
    
    // Нельзя бронировать слот в закрытой или завершенной тренировке
    if (training.status !== TrainingState.OPEN) {
      throw new BadRequestException('This training session is not open for bookings');
    }
    
    // Проверка на наличие свободных слотов
    if (training.currentSlots >= training.maxSlots) {
      throw new ConflictException('This training session is full');
    }
    
    // Проверка, что пользователь еще не участвует
    const isParticipant = await this.trainingsRepository.isParticipant(trainingId, userId);
    if (isParticipant) {
      throw new BadRequestException('You are already booked for this training session');
    }
    
    return this.trainingsRepository.bookSlot(trainingId, userId);
  }

  async cancelBooking(trainingId: string, userId: string): Promise<TrainingEntity> {
    const training = await this.findById(trainingId);
    
    // Если пользователь создатель, он не может отменить свое участие
    if (training.creatorId === parseInt(userId)) {
      throw new BadRequestException('As the creator, you cannot cancel your participation');
    }
    
    // Проверка, что пользователь участвует
    const isParticipant = await this.trainingsRepository.isParticipant(trainingId, userId);
    if (!isParticipant) {
      throw new BadRequestException('You are not a participant of this training session');
    }
    
    return this.trainingsRepository.cancelBooking(trainingId, userId);
  }

  async cancelTraining(trainingId: string, userId: string): Promise<TrainingEntity> {
    const training = await this.findById(trainingId);
    
    // Только создатель может отменить тренировку
    if (training.creatorId !== parseInt(userId)) {
      throw new ForbiddenException('Only the creator can cancel a training session');
    }
    
    // Нельзя отменить уже завершенную тренировку
    if (training.status === TrainingState.DONE) {
      throw new BadRequestException('Cannot cancel a completed training session');
    }
    
    return this.trainingsRepository.cancelTraining(trainingId, userId);
  }
}