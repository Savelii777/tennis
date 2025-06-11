import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MatchEntity } from '../../domain/entities/match.entity';
import { CreateMatchDto } from '../../application/dto/create-match.dto';
import { UpdateMatchDto } from '../../application/dto/update-match.dto';

@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<MatchEntity[]> {
    const matches = await this.prisma.match.findMany();
    return matches.map(match => this.mapToEntity(match));
  }

  async findById(id: string): Promise<MatchEntity | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: parseInt(id) },
    });

    return match ? this.mapToEntity(match) : null;
  }

  async findByCreator(creatorId: string): Promise<MatchEntity[]> {
    const matches = await this.prisma.match.findMany({
      where: { creatorId: parseInt(creatorId) },
    });

    return matches.map(match => this.mapToEntity(match));
  }

  async create(userId: string, createMatchDto: CreateMatchDto): Promise<MatchEntity> {
    const match = await this.prisma.match.create({
      data: {
        creatorId: parseInt(userId),
        player1Id: createMatchDto.player1Id,
        player2Id: createMatchDto.player2Id,
        optionalId: createMatchDto.optionalId,
        type: createMatchDto.type,
        state: createMatchDto.state ?? 'PENDING',
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(match);
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<MatchEntity> {
    const match = await this.prisma.match.update({
      where: { id: parseInt(id) },
      data: {
        ...updateMatchDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(match);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.match.delete({
      where: { id: parseInt(id) },
    });
  }

  private mapToEntity(data: any): MatchEntity {
    return new MatchEntity({
      id: data.id,
      creatorId: data.creatorId,
      player1Id: data.player1Id,
      player2Id: data.player2Id,
      optionalId: data.optionalId,
      type: data.type,
      state: data.state,
      score: data.score,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}