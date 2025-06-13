import { TrainingsRepository } from '../../infrastructure/repositories/trainings.repository';
import { TrainingEntity } from '../../domain/entities/training.entity';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
export declare class TrainingsService {
    private readonly trainingsRepository;
    private readonly prisma;
    constructor(trainingsRepository: TrainingsRepository, prisma: PrismaService);
    findAll(filters?: any): Promise<TrainingEntity[]>;
    findById(id: string): Promise<TrainingEntity>;
    create(userId: string, createTrainingDto: CreateTrainingDto): Promise<TrainingEntity>;
    bookSlot(trainingId: string, userId: string): Promise<TrainingEntity>;
    cancelBooking(trainingId: string, userId: string): Promise<TrainingEntity>;
    cancelTraining(trainingId: string, userId: string): Promise<TrainingEntity>;
}
