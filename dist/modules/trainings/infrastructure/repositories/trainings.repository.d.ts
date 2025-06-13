import { PrismaService } from '../../../../prisma/prisma.service';
import { TrainingEntity } from '../../domain/entities/training.entity';
import { CreateTrainingDto } from '../../application/dto/create-training.dto';
export declare class TrainingsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: any): Promise<TrainingEntity[]>;
    findById(id: string): Promise<TrainingEntity | null>;
    create(userId: string, dto: CreateTrainingDto): Promise<TrainingEntity>;
    bookSlot(trainingId: string, userId: string): Promise<TrainingEntity>;
    cancelBooking(trainingId: string, userId: string): Promise<TrainingEntity>;
    isParticipant(trainingId: string, userId: string): Promise<boolean>;
    cancelTraining(trainingId: string, userId: string): Promise<TrainingEntity>;
    private mapToEntity;
}
