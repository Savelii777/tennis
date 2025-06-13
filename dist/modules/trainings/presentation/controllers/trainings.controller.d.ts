import { TrainingsService } from '../../application/services/trainings.service';
import { CreateTrainingDto } from '../../application/dto/create-training.dto';
import { BookTrainingDto } from '../../application/dto/book-training.dto';
import { Request } from 'express';
interface RequestWithUser extends Request {
    user: {
        id: string;
    };
}
export declare class TrainingsController {
    private readonly trainingsService;
    constructor(trainingsService: TrainingsService);
    findAll(trainingType?: string, status?: string, minDate?: string, maxDate?: string): Promise<import("../../domain/entities/training.entity").TrainingEntity[]>;
    findOne(id: string): Promise<import("../../domain/entities/training.entity").TrainingEntity>;
    create(createTrainingDto: CreateTrainingDto, req: RequestWithUser): Promise<import("../../domain/entities/training.entity").TrainingEntity>;
    bookSlot(id: string, bookTrainingDto: BookTrainingDto, req: RequestWithUser): Promise<import("../../domain/entities/training.entity").TrainingEntity>;
    cancelBooking(id: string, req: RequestWithUser): Promise<import("../../domain/entities/training.entity").TrainingEntity>;
    cancelTraining(id: string, req: RequestWithUser): Promise<import("../../domain/entities/training.entity").TrainingEntity>;
}
export {};
