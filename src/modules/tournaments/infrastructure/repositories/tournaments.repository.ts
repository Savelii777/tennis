import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TournamentEntity } from '../../domain/entities/tournament.entity';
import { TournamentMatchEntity } from '../../domain/entities/tournament-match.entity';
import { CreateTournamentDto } from '../../application/dto/create-tournament.dto';
import { UpdateTournamentDto } from '../../application/dto/update-tournament.dto';
import { RecordTournamentMatchDto } from '../../application/dto/record-tournament-match.dto';
import { MatchStatus, TournamentStatus, TournamentType as DomainTournamentType } from '../../domain/enums/tournament.enum';
import { Prisma, TournamentType } from '@prisma/client';

@Injectable()
export class TournamentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any): Promise<TournamentEntity[]> {
    const prismaFilters: Prisma.TournamentWhereInput = {};
    if (filters) {
      if (filters.status) prismaFilters.status = { equals: filters.status };
      if (filters.type) prismaFilters.type = { equals: filters.type };
    }
    
    const tournaments = await this.prisma.tournament.findMany({
      where: prismaFilters,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    return tournaments.map(tournament => this.mapToEntity(tournament));
  }

  async findById(id: string): Promise<TournamentEntity | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    if (!tournament) return null;
    
    return this.mapToEntity(tournament);
  }

  async findByCreator(creatorId: string): Promise<TournamentEntity[]> {
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        creatorId: parseInt(creatorId) 
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    return tournaments.map(tournament => this.mapToEntity(tournament));
  }

  async create(userId: string, createTournamentDto: CreateTournamentDto): Promise<TournamentEntity> {
    const tournamentType = this.mapToPrismaTournamentType(createTournamentDto.type);
    const userIdNum = parseInt(userId);
    
    const tournament = await this.prisma.tournament.create({
      data: {
        title: createTournamentDto.title,
        description: createTournamentDto.description,
        type: tournamentType,
        status: TournamentStatus.DRAFT,
        creatorId: userIdNum,
        startDate: createTournamentDto.startDate,
        endDate: createTournamentDto.endDate,
        formatDetails: createTournamentDto.formatDetails || {},
        minPlayers: createTournamentDto.minPlayers,
        maxPlayers: createTournamentDto.maxPlayers,
        currentPlayers: 1, 
        isRanked: createTournamentDto.isRanked,
        locationId: createTournamentDto.locationId,
        locationName: createTournamentDto.locationName
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    await this.prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournament.id}, ${userIdNum})
      ON CONFLICT DO NOTHING
    `;
    
    return this.mapToEntity(tournament);
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<TournamentEntity> {
    const data: Prisma.TournamentUpdateInput = {};
    
    if (updateTournamentDto.title !== undefined) data.title = updateTournamentDto.title;
    if (updateTournamentDto.description !== undefined) data.description = updateTournamentDto.description;
    if (updateTournamentDto.type !== undefined) data.type = this.mapToPrismaTournamentType(updateTournamentDto.type);
    if (updateTournamentDto.status !== undefined) data.status = updateTournamentDto.status;
    if (updateTournamentDto.startDate !== undefined) data.startDate = updateTournamentDto.startDate;
    if (updateTournamentDto.endDate !== undefined) data.endDate = updateTournamentDto.endDate;
    if (updateTournamentDto.formatDetails !== undefined) data.formatDetails = updateTournamentDto.formatDetails;
    if (updateTournamentDto.isRanked !== undefined) data.isRanked = updateTournamentDto.isRanked;
    if (updateTournamentDto.locationId !== undefined) data.locationId = updateTournamentDto.locationId;
    if (updateTournamentDto.locationName !== undefined) data.locationName = updateTournamentDto.locationName;
    
    const tournament = await this.prisma.tournament.update({
      where: { id: parseInt(id) },
      data,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    return this.mapToEntity(tournament);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tournament.delete({
      where: { id: parseInt(id) },
    });
  }

  async isPlayerRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM "_TournamentToUser"
      WHERE "A" = ${parseInt(tournamentId)} AND "B" = ${parseInt(userId)}
    `;
    
    return result[0].count > 0;
  }

  async addPlayer(tournamentId: string, userId: string): Promise<TournamentEntity> {

    await this.prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${parseInt(tournamentId)}, ${parseInt(userId)})
      ON CONFLICT DO NOTHING
    `;

    await this.prisma.$executeRaw`
      UPDATE "Tournament"
      SET "currentPlayers" = "currentPlayers" + 1
      WHERE id = ${parseInt(tournamentId)}
    `;
    
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    return this.mapToEntity(tournament);
  }

  async removePlayer(tournamentId: string, userId: string): Promise<TournamentEntity> {
    await this.prisma.$executeRaw`
      DELETE FROM "_TournamentToUser" 
      WHERE "A" = ${parseInt(tournamentId)} AND "B" = ${parseInt(userId)}
    `;
    
    await this.prisma.$executeRaw`
      UPDATE "Tournament"
      SET "currentPlayers" = GREATEST("currentPlayers" - 1, 0)
      WHERE id = ${parseInt(tournamentId)}
    `;
    
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });
    
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    return this.mapToEntity(tournament);
  }

  async getTournamentPlayers(tournamentId: string): Promise<any[]> {
    const players = await this.prisma.$queryRaw`
      SELECT u.id, u.username, u."firstName", u."lastName", 
             p."avatarUrl", p."ratingPoints" as rating_points
      FROM "User" u
      LEFT JOIN "UserProfile" p ON u.id = p."userId"
      JOIN "_TournamentToUser" tu ON u.id = tu."B"
      WHERE tu."A" = ${parseInt(tournamentId)}
    `;
    
    return Array.isArray(players) ? players : [];
  }
  
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatchEntity[]> {
    try {
      const matches = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        ORDER BY "round" ASC, "group" ASC, "createdAt" ASC
      `;
      
      return matches.map(match => this.mapMatchToEntity(match));
    } catch (error) {
      console.error('Error fetching tournament matches:', error);
      return [];
    }
  }
  
  async getTournamentMatch(matchId: string): Promise<TournamentMatchEntity | null> {
    try {
      const match = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE id = ${parseInt(matchId)}
      `;
      
      if (!match || match.length === 0) return null;
      
      return this.mapMatchToEntity(match[0]);
    } catch (error) {
      console.error('Error fetching tournament match:', error);
      return null;
    }
  }
  
  async getMatchesByRound(tournamentId: string, round: number): Promise<TournamentMatchEntity[]> {
    try {
      const matches = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "round" = ${round}
        ORDER BY "createdAt" ASC
      `;
      
      return matches.map(match => this.mapMatchToEntity(match));
    } catch (error) {
      console.error('Error fetching matches by round:', error);
      return [];
    }
  }
  
  async getMatchByRoundAndPosition(tournamentId: string, round: number, position: number): Promise<TournamentMatchEntity | null> {
    try {
      const matches = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "round" = ${round}
        ORDER BY "createdAt" ASC
        OFFSET ${position} LIMIT 1
      `;
      
      if (!matches || matches.length === 0) return null;
      
      return this.mapMatchToEntity(matches[0]);
    } catch (error) {
      console.error('Error fetching match by round and position:', error);
      return null;
    }
  }
  
  async getGroupMatches(tournamentId: string): Promise<TournamentMatchEntity[]> {
    try {
      const matches = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "group" IS NOT NULL
        ORDER BY "group" ASC, "createdAt" ASC
      `;
      
      return matches.map(match => this.mapMatchToEntity(match));
    } catch (error) {
      console.error('Error fetching group matches:', error);
      return [];
    }
  }
  
  async getThirdPlaceMatch(tournamentId: string): Promise<TournamentMatchEntity | null> {
    try {
      const match = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND "isThirdPlaceMatch" = true
      `;
      
      if (!match || match.length === 0) return null;
      
      return this.mapMatchToEntity(match[0]);
    } catch (error) {
      console.error('Error fetching third place match:', error);
      return null;
    }
  }
  
  async createMatches(tournamentId: string, matchesData: any[]): Promise<TournamentMatchEntity[]> {
    const createdMatches: TournamentMatchEntity[] = [];
    
    for (const matchData of matchesData) {
      try {
        const round = matchData.round || null;
        const group = matchData.group || null;
        const playerBId = matchData.playerBId || null;
        const court = matchData.court || null;
        const scheduledAt = matchData.scheduledAt ? new Date(matchData.scheduledAt) : null;
        const confirmedBy = matchData.confirmedBy || [];
        const confirmedByJson = JSON.stringify(confirmedBy);
        const isThirdPlaceMatch = matchData.isThirdPlaceMatch || false;
        
        const result = await this.prisma.$queryRaw<any[]>`
          INSERT INTO "TournamentMatch" (
            "tournamentId", "round", "group", "playerAId", "playerBId",
            "status", "court", "scheduledAt", "confirmedBy", "isThirdPlaceMatch", "createdAt", "updatedAt"
          )
          VALUES (
            ${parseInt(tournamentId)}, ${round}, ${group}, ${matchData.playerAId}, ${playerBId},
            ${matchData.status}, ${court}, ${scheduledAt}, ${confirmedByJson}::jsonb, ${isThirdPlaceMatch}, NOW(), NOW()
          )
          RETURNING *
        `;
        
        if (result && result.length > 0) {
          createdMatches.push(this.mapMatchToEntity(result[0]));
        }
      } catch (error) {
        console.error('Error creating match:', error);
      }
    }
    
    return createdMatches;
  }
  
  async recordMatchResult(matchId: string, recordMatchDto: RecordTournamentMatchDto): Promise<TournamentMatchEntity> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
        UPDATE "TournamentMatch"
        SET 
          "score" = ${recordMatchDto.score},
          "winnerId" = ${recordMatchDto.winnerId},
          "status" = 'FINISHED',
          "updatedAt" = NOW()
        WHERE id = ${parseInt(matchId)}
        RETURNING *
      `;
      
      if (!result || result.length === 0) {
        throw new NotFoundException(`Match with ID ${matchId} not found`);
      }
      
      return this.mapMatchToEntity(result[0]);
    } catch (error) {
      console.error('Error recording match result:', error);
      throw error;
    }
  }
  
  async confirmMatch(matchId: string, userId: string): Promise<TournamentMatchEntity> {
    const match = await this.getTournamentMatch(matchId);
    
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }
    
    const confirmedBy = [...(match.confirmedBy || [])];
    const userIdNum = parseInt(userId);
    
    if (!confirmedBy.includes(userIdNum)) {
      confirmedBy.push(userIdNum);
    }
    
    try {
      const confirmedByJson = JSON.stringify(confirmedBy);
      
      const result = await this.prisma.$queryRaw<any[]>`
        UPDATE "TournamentMatch"
        SET 
          "confirmedBy" = ${confirmedByJson}::jsonb,
          "updatedAt" = NOW()
        WHERE id = ${parseInt(matchId)}
        RETURNING *
      `;
      
      if (!result || result.length === 0) {
        throw new NotFoundException(`Match with ID ${matchId} not found`);
      }
      
      return this.mapMatchToEntity(result[0]);
    } catch (error) {
      console.error('Error confirming match:', error);
      throw error;
    }
  }
  
  async updateMatch(matchId: string, updateData: any): Promise<TournamentMatchEntity> {
    try {
      let updateQuery = 'UPDATE "TournamentMatch" SET ';
      const updateValues: any[] = [];
      const updateFields: string[] = [];
      
      if (updateData.playerAId !== undefined) {
        updateFields.push('"playerAId" = $' + (updateValues.length + 1));
        updateValues.push(updateData.playerAId);
      }
      
      if (updateData.playerBId !== undefined) {
        updateFields.push('"playerBId" = $' + (updateValues.length + 1));
        updateValues.push(updateData.playerBId);
      }
      
      if (updateData.score !== undefined) {
        updateFields.push('"score" = $' + (updateValues.length + 1));
        updateValues.push(updateData.score);
      }
      
      if (updateData.winnerId !== undefined) {
        updateFields.push('"winnerId" = $' + (updateValues.length + 1));
        updateValues.push(updateData.winnerId);
      }
      
      if (updateData.status !== undefined) {
        updateFields.push('"status" = $' + (updateValues.length + 1));
        updateValues.push(updateData.status);
      }
      
      updateFields.push('"updatedAt" = NOW()');
      
      updateQuery += updateFields.join(', ');
      updateQuery += ' WHERE id = $' + (updateValues.length + 1);
      updateValues.push(parseInt(matchId));
      updateQuery += ' RETURNING *';
      
      const result = await this.prisma.$queryRawUnsafe(updateQuery, ...updateValues);
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new NotFoundException(`Match with ID ${matchId} not found`);
      }
      
      return this.mapMatchToEntity(result[0]);
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  }
  
  async areAllMatchesCompleted(tournamentId: string): Promise<boolean> {
    try {
      const count = await this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM "TournamentMatch"
        WHERE "tournamentId" = ${parseInt(tournamentId)}
        AND status <> 'FINISHED'
      `;
      
      return count[0].count === 0;
    } catch (error) {
      console.error('Error checking if all matches are completed:', error);
      return false;
    }
  }

  private mapToEntity(data: any): TournamentEntity {
    if (!data) return {} as TournamentEntity;
    
    return new TournamentEntity({
      id: data.id,
      title: data.title,
      description: data.description,
      type: this.mapToDomainTournamentType(data.type),
      status: data.status,
      creatorId: data.creatorId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      formatDetails: data.formatDetails,
      minPlayers: data.minPlayers,
      maxPlayers: data.maxPlayers,
      currentPlayers: data.currentPlayers,
      isRanked: data.isRanked,
      locationId: data.locationId,
      locationName: data.locationName,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
  
  private mapMatchToEntity(data: any): TournamentMatchEntity {
    if (!data) return {} as TournamentMatchEntity;
    
    return new TournamentMatchEntity({
      id: data.id,
      tournamentId: data.tournamentId,
      round: data.round,
      group: data.group,
      playerAId: data.playerAId,
      playerBId: data.playerBId,
      score: data.score,
      winnerId: data.winnerId,
      status: data.status,
      court: data.court,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      confirmedBy: Array.isArray(data.confirmedBy) ? data.confirmedBy : [],
      isThirdPlaceMatch: data.isThirdPlaceMatch || false,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
  
  private mapToPrismaTournamentType(type: DomainTournamentType): TournamentType {
    switch(type) {
      case DomainTournamentType.SINGLE_ELIMINATION:
        return TournamentType.SINGLE_ELIMINATION;
      case DomainTournamentType.GROUPS_PLAYOFF:
        return TournamentType.GROUPS_PLAYOFF;
      case DomainTournamentType.LEAGUE:
        return TournamentType.LEAGUE;
      case DomainTournamentType.BLITZ:
        return TournamentType.BLITZ;
      default:
        return TournamentType.SINGLE_ELIMINATION;
    }
  }
  
  private mapToDomainTournamentType(type: string): DomainTournamentType {
    switch(type) {
      case 'SINGLE_ELIMINATION':
        return DomainTournamentType.SINGLE_ELIMINATION;
      case 'GROUPS_PLAYOFF':
        return DomainTournamentType.GROUPS_PLAYOFF;
      case 'LEAGUE':
        return DomainTournamentType.LEAGUE;
      case 'BLITZ':
        return DomainTournamentType.BLITZ;
      default:
        return DomainTournamentType.SINGLE_ELIMINATION;
    }
  }
}