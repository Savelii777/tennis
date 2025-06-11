import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/users/domain/enums/role.enum';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);