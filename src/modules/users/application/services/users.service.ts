import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateProfileDto } from '../../presentation/dto/update-profile.dto';
import { ProfileStatisticsDto } from '../../presentation/dto/profile-statistics.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  async findByTelegramId(telegramId: string): Promise<UserEntity> {
    return this.usersRepository.findByTelegramId(telegramId);
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
}