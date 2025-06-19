import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { Role } from '../../domain/enums/role.enum';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

    async updateTelegramChatId(userId: number, telegramChatId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { telegramChatId },
    });
  }

  async setReferrer(userId: number, referrerId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { referredBy: referrerId },
    });
  }
  
  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      include: { profile: true }
    });
    return users.map(this.mapToEntity);
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { profile: true }
    });
    return this.mapToEntity(user);
  }

  async findByTelegramId(telegramId: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: { profile: true }
    });
    
    if (!user) {
      return null as any; 
    }
    
    return this.mapToEntity(user);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = await this.prisma.user.create({
      data: {
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: (user.role as Role) || Role.USER, 
        profile: {
          create: {
            avatarUrl: null,
            city: null,
            countryCode: null,
          }
        }
      },
      include: { profile: true }
    });
    return this.mapToEntity(createdUser);
  }
  async updateUser(id: string, updateData: any): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        countryCode: updateData.countryCode,
        cityId: updateData.cityId,
        sportId: updateData.sportId,
      },
      include: { 
        profile: true,
        country: true,
        city: {
          include: {
            country: true
          }
        },
        sport: true,
      }
    });
    return this.mapToEntity(user);
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        username: updateUserDto.username
      },
      include: { profile: true }
    });
    return this.mapToEntity(user);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        profile: {
          update: {
            avatarUrl: updateProfileDto.avatarUrl,
            city: updateProfileDto.city,
            countryCode: updateProfileDto.countryCode,
            isPublicProfile: updateProfileDto.isPublicProfile
          }
        }
      },
      include: { profile: true }
    });
    return this.mapToEntity(user);
  }

  async getRatingHistory(userId: string): Promise<any[]> {

    return [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), rating: 940 },
      { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), rating: 970 },
      { date: new Date(), rating: 1000 },
    ];
  }

  async getUserAchievements(userId: string): Promise<Record<string, any>> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true }
    });
    
    if (!user || !user.profile) return {};
    
    return (user.profile.achievements as Record<string, any>) || {};
  }

  async addAchievement(userId: string, achievementKey: string, achievementData: any): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true }
    });
    
    if (!user || !user.profile) throw new NotFoundException('User profile not found');
    
    const achievements = (user.profile.achievements as Record<string, any>) || {};
    
    achievements[achievementKey] = {
      ...achievementData,
      unlockedAt: new Date()
    };
    
    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        profile: {
          update: {
            achievements: achievements
          }
        }
      },
      include: { profile: true }
    });
    
    return this.mapToEntity(updatedUser);
  }

  async getRecentMatches(userId: string, limit: number = 5): Promise<any[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { creatorId: parseInt(userId) },
          { player1Id: parseInt(userId) },
          { player2Id: parseInt(userId) }
        ],
        state: { in: ['FINISHED', 'CANCELLED'] }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        creator: { 
          select: { 
            username: true, 
            firstName: true, 
            lastName: true, 
            profile: { select: { avatarUrl: true } } 
          } 
        }
      }
    });
    
    const result = await Promise.all(matches.map(async match => {
      const opponentId = match.player1Id === parseInt(userId) 
        ? match.player2Id 
        : match.player1Id;
      
      let opponent = null;
      if (opponentId) {
        const user = await this.prisma.user.findUnique({
          where: { id: opponentId },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: { select: { avatarUrl: true } }
          }
        });
        opponent = user;
      }
      
      return {
        id: match.id,
        date: match.updatedAt,
        type: match.type,
        score: match.score,
        state: match.state,
        opponent
      };
    }));
    
    return result;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        profile: {
          update: {
            avatarUrl: avatarUrl,
            updatedAt: new Date()
          }
        }
      },
      include: { profile: true }
    });
    
    return this.mapToEntity(user);
  }

  async updateMatchStats(userId: string, isWin: boolean): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }
    
    const profile = await this.prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        matchesPlayed: { increment: 1 },
        matchWins: isWin ? { increment: 1 } : undefined,
        matchLosses: !isWin ? { increment: 1 } : undefined,
        ratingPoints: { increment: isWin ? 30 : 5 },
        lastActivity: new Date()
      }
    });
    
    const updatedUser = {
      ...user,
      profile
    };
    
    return this.mapToEntity(updatedUser);
  }
// Добавьте этот метод в класс UsersRepository

  async findByIdWithLocation(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: true,
        country: true,
        city: {
          include: {
            country: true
          }
        },
        sport: true,
      },
    });

    return user ? this.mapToEntity(user) : null;
  }
  async updateTournamentStats(userId: string, isWin: boolean): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      throw new NotFoundException('User profile not found');
    }
    
    const profile = await this.prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        tournamentsPlayed: { increment: 1 },
        tournamentsWon: isWin ? { increment: 1 } : undefined,
        ratingPoints: { increment: isWin ? 100 : 20 },
        lastActivity: new Date()
      }
    });
    
    const updatedUser = {
      ...user,
      profile
    };
    
    return this.mapToEntity(updatedUser);
  }

  private mapToEntity(prismaUser: any): UserEntity {
    if (!prismaUser) {
      return null as any;
    }
    
    const user = new UserEntity();
    user.id = prismaUser.id;
    user.telegram_id = prismaUser.telegramId;
    user.username = prismaUser.username;
    user.first_name = prismaUser.firstName;
    user.last_name = prismaUser.lastName;
    user.is_verified = prismaUser.isVerified;
    user.role = prismaUser.role;
    
    if (prismaUser.profile) {
      const profile = new UserProfileEntity({
        id: prismaUser.profile.id,
        user_id: prismaUser.id,
        avatar_url: prismaUser.profile.avatarUrl,
        city: prismaUser.profile.city,
        country_code: prismaUser.profile.countryCode,
        sport_type: prismaUser.profile.sportType,
        ntrp_rating: prismaUser.profile.ntrpRating,
        rating_points: prismaUser.profile.ratingPoints,
        matches_played: prismaUser.profile.matchesPlayed,
        match_wins: prismaUser.profile.matchWins,
        match_losses: prismaUser.profile.matchLosses,
        tournaments_played: prismaUser.profile.tournamentsPlayed,
        tournaments_won: prismaUser.profile.tournamentsWon,
        last_activity: prismaUser.profile.lastActivity,
        achievements: prismaUser.profile.achievements,
        is_public_profile: prismaUser.profile.isPublicProfile
      });
      
      user.profile = profile;
     
    }
    
    return user;
  }
}