import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { ProfileStatisticsDto } from '../../presentation/dto/profile-statistics.dto';
import { ProfileStepOneDto } from '../../presentation/dto/profile-step-one.dto';
import { ProfileStepTwoDto } from '../../presentation/dto/profile-step-two.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Role } from '../../domain/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByTelegramId(telegramId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        profile: true
      }
    });
    
    if (!user) {
      return null;
    }
    
    // Create entity directly without using repository method
    const entity = new UserEntity();
    entity.id = user.id;
    entity.telegram_id = user.telegramId;
    entity.username = user.username;
    entity.first_name = user.firstName;
    entity.is_verified = user.isVerified;
    entity.role = user.role as Role;
    
    // Map profile if it exists
    // Map profile if it exists
    if (user.profile) {
      entity.profile = user.profile as any;
    }
    
    return entity;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = new UserEntity();
    Object.assign(user, createUserDto);
    return this.usersRepository.create(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.findById(id); 
    return this.usersRepository.update(id, updateUserDto);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<UserEntity> {
    await this.findById(id); 
    return this.usersRepository.updateProfile(id, updateProfileDto);
  }

  async getRatingHistory(userId: string): Promise<any[]> {
    return this.usersRepository.getRatingHistory(userId);
  }

  async getProfileStatistics(userId: string): Promise<ProfileStatisticsDto> {
    const user = await this.findById(userId);
    
    return {
      matchesPlayed: user.profile.matches_played,
      matchWins: user.profile.match_wins,
      matchLosses: user.profile.match_losses,
      tournamentsPlayed: user.profile.tournaments_played,
      tournamentsWon: user.profile.tournaments_won,
      winRate: user.profile.winRate,
      ratingPoints: user.profile.rating_points,
      lastActivity: user.profile.last_activity
    };
  }

  async getUserAchievements(userId: string): Promise<Record<string, any>> {
    return this.usersRepository.getUserAchievements(userId);
  }
  
  async updateMatchStats(userId: string, isWin: boolean): Promise<UserEntity> {
    return this.usersRepository.updateMatchStats(userId, isWin);
  }

  async updateTournamentStats(userId: string, isWin: boolean): Promise<UserEntity> {
    return this.usersRepository.updateTournamentStats(userId, isWin);
  }

  async addAchievement(userId: string, achievementKey: string, achievementData: any): Promise<UserEntity> {
    return this.usersRepository.addAchievement(userId, achievementKey, achievementData);
  }

  async getRecentMatches(userId: string, limit: number = 5): Promise<any[]> {
    return this.usersRepository.getRecentMatches(userId, limit);
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<UserEntity> {
  
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersRepository.updateAvatar(userId, avatarUrl);
  }
  async completeProfileStepOne(userId: string, profileData: ProfileStepOneDto): Promise<any> {
    // Проверить существование пользователя
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Сохранить данные первого шага
    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        city: profileData.city,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand,
        preferredPlayTime: profileData.preferredPlayTime,
        playsInTournaments: profileData.playsInTournaments,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency,
        profileStepOneCompleted: true
      },
      create: {
        user: { connect: { id: parseInt(userId) } },
        city: profileData.city,
        preferredCourt: profileData.preferredCourt,
        dominantHand: profileData.dominantHand,
        preferredPlayTime: profileData.preferredPlayTime,
        playsInTournaments: profileData.playsInTournaments,
        weeklyPlayFrequency: profileData.weeklyPlayFrequency,
        profileStepOneCompleted: true
      }
    });
    
    // Обновить имя/фамилию если предоставлены
    if (profileData.firstName || profileData.lastName) {
      await this.prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          firstName: profileData.firstName || user.first_name, // исправлено поле
          lastName: profileData.lastName || user.last_name     // исправлено поле
        }
      });
    }
    
    return { 
      status: 'success',
      message: 'Profile step 1 completed', 
      profileId: updatedProfile.id 
    };
  }

  async completeProfileStepTwo(userId: string, profileData: ProfileStepTwoDto): Promise<any> {
    // Проверить существование пользователя и завершение первого шага
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (!profile) {
      throw new BadRequestException('Complete step 1 first');
    }
    
    // Рассчитать начальный рейтинг на основе самооценки
    let initialRating = 0;
    let ntrpEstimate = 0;
    
    switch(profileData.selfAssessedLevel) {
      case 'BEGINNER':
        initialRating = 1000;
        ntrpEstimate = 2.0;
        break;
      case 'AMATEUR':
        initialRating = 1200;
        ntrpEstimate = 3.0;
        break;
      case 'CONFIDENT':
        initialRating = 1400;
        ntrpEstimate = 4.0;
        break;
      case 'TOURNAMENT':
        initialRating = 1600;
        ntrpEstimate = 5.0;
        break;
      case 'SEMI_PRO':
        initialRating = 1800;
        ntrpEstimate = 5.5;
        break;
    }
    
    // Сохранить данные второго шага
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        backhandType: profileData.backhandType,
        preferredSurface: profileData.preferredSurface,
        playingStyle: profileData.playingStyle,
        favoriteShot: profileData.favoriteShot,
        racket: profileData.racket,
        opponentPreference: profileData.opponentPreference,
        selfAssessedLevel: profileData.selfAssessedLevel,
        initialRatingPoints: initialRating,
        ratingPoints: initialRating,
        ntrpRating: ntrpEstimate,
        profileStepTwoCompleted: true
      }
    });
    
    return { 
      status: 'success',
      message: 'Profile step 2 completed',
      profileId: updatedProfile.id,
      initialRating: initialRating,
      ntrpEstimate: ntrpEstimate
    };
  }

  async getProfileCompletionStatus(userId: string): Promise<any> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (!profile) {
      return { 
        stepOneCompleted: false, 
        stepTwoCompleted: false,
        profileComplete: false
      };
    }
    
    return {
      stepOneCompleted: profile.profileStepOneCompleted || false,
      stepTwoCompleted: profile.profileStepTwoCompleted || false,
      profileComplete: (profile.profileStepOneCompleted && profile.profileStepTwoCompleted) || false
    };
  }
  // Добавьте эти методы в класс UsersService

  async updateUserLocation(userId: string, locationData: {
    countryCode?: string;
    cityId?: number;
    sportId?: number;
  }) {
    return this.usersRepository.updateUser(userId, {
      countryCode: locationData.countryCode,
      cityId: locationData.cityId,
      sportId: locationData.sportId,
    });
  }

  async getUserWithLocation(userId: string) {
    return this.usersRepository.findByIdWithLocation(userId);
  }
}