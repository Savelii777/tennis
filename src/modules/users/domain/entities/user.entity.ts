import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { Role } from '../enums/role.enum';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegram_id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: Role.USER })
  role: Role;

  @OneToOne(() => UserProfileEntity, (profile: UserProfileEntity) => profile.user)
  profile: UserProfileEntity;

  ballsBalance?: number; // ← Добавить если отсутствует

}

export { UserEntity as User };