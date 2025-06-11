import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { SportType } from '../enums/sport-type.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class UserProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Exclude()
  @OneToOne(() => UserEntity, (user: UserEntity) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country_code?: string;

  @Column({ default: 'TENNIS' })
  sport_type: SportType;

  @Column({ nullable: true, type: 'float' })
  ntrp_rating?: number;

  @Column({ default: 0 })
  rating_points: number;

  @Column({ default: 0 })
  matches_played: number;

  @Column({ default: 0 })
  match_wins: number;

  @Column({ default: 0 })
  match_losses: number;

  @Column({ default: 0 })
  tournaments_played: number;

  @Column({ default: 0 })
  tournaments_won: number;

  @Column({ nullable: true })
  last_activity?: Date;

  @Column({ nullable: true, type: 'json' })
  achievements?: any;

  @Column({ default: true })
  is_public_profile: boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }

  get winRate(): string {
    if (this.matches_played === 0) return '0';
    return ((this.match_wins / this.matches_played) * 100).toFixed(1);
  }
}