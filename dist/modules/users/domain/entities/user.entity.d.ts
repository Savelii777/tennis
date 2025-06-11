import { UserProfileEntity } from './user-profile.entity';
import { Role } from '../enums/role.enum';
export declare class UserEntity {
    id: number;
    telegram_id: string;
    username: string;
    first_name: string;
    last_name?: string;
    is_verified: boolean;
    role: Role;
    profile: UserProfileEntity;
}
export { UserEntity as User };
