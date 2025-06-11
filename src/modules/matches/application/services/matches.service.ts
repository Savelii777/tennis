import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MatchesRepository } from '../../infrastructure/repositories/matches.repository';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { RecordScoreDto } from '../dto/record-score.dto';
import { MatchEntity } from '../../domain/entities/match.entity';
import { MatchState } from '../../domain/enums/match.enum';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}

  async findAll(): Promise<MatchEntity[]> {
    return this.matchesRepository.findAll();
  }

  async findById(id: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async findByCreator(creatorId: string): Promise<MatchEntity[]> {
    return this.matchesRepository.findByCreator(creatorId);
  }

  async create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity> {
    return this.matchesRepository.create(userId, createMatchDto);
  }

  async update(id: string, userId: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId)) {
      throw new BadRequestException('You can only update matches you created');
    }
    
    return this.matchesRepository.update(id, updateMatchDto);
  }

  async confirmMatch(id: string, userId: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.state !== MatchState.PENDING) {
      throw new BadRequestException('Only pending matches can be confirmed');
    }
    
    const updateDto: UpdateMatchDto = { state: MatchState.CONFIRMED };
    return this.matchesRepository.update(id, updateDto);
  }

  async cancelMatch(id: string, userId: string): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId) && 
        match.player1Id !== parseInt(userId) && 
        match.player2Id !== parseInt(userId)) {
      throw new BadRequestException('You are not a participant in this match');
    }
    
    if (match.state === MatchState.FINISHED) {
      throw new BadRequestException('Finished matches cannot be cancelled');
    }
    
    const updateDto: UpdateMatchDto = { state: MatchState.CANCELLED };
    return this.matchesRepository.update(id, updateDto);
  }

  async recordScore(id: string, userId: string, recordScoreDto: RecordScoreDto): Promise<MatchEntity> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId)) {
      throw new BadRequestException('Only match creator can record scores');
    }
    
    if (match.state !== MatchState.CONFIRMED) {
      throw new BadRequestException('Only confirmed matches can have scores recorded');
    }
    
    const updateDto: UpdateMatchDto = {
      state: MatchState.FINISHED,
      score: recordScoreDto.score
    };
    
    return this.matchesRepository.update(id, updateDto);
  }

  async delete(id: string, userId: string): Promise<void> {
    const match = await this.matchesRepository.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    if (match.creatorId !== parseInt(userId)) {
      throw new BadRequestException('Only match creator can delete matches');
    }
    
    return this.matchesRepository.delete(id);
  }
}