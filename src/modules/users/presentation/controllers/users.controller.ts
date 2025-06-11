import { 
  Controller, Get, Post, Put, Patch, Body, Param, 
  UseGuards, Request, NotFoundException, ForbiddenException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: { id: number; role: string; [key: string]: any };
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: RequestWithUser): Promise<any> {
    return this.usersService.findById(req.user.id.toString());
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Request() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto): Promise<any> {
    return this.usersService.updateProfile(req.user.id.toString(), updateProfileDto);
  }

  @Get('me/statistics')
  @ApiOperation({ summary: 'Get current user statistics' })
  async getMyStatistics(@Request() req: RequestWithUser): Promise<any> {
    return this.usersService.getProfileStatistics(req.user.id.toString());
  }

  @Get('me/achievements')
  @ApiOperation({ summary: 'Get current user achievements' })
  async getMyAchievements(@Request() req: RequestWithUser): Promise<any> {
    return this.usersService.getUserAchievements(req.user.id.toString());
  }

  @Get('me/rating-history')
  @ApiOperation({ summary: 'Get current user rating history' })
  async getMyRatingHistory(@Request() req: RequestWithUser): Promise<any> {
    return this.usersService.getRatingHistory(req.user.id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Request() req: RequestWithUser, @Param('id') id: string): Promise<any> {
    const user = await this.usersService.findById(id);
    
    if (req.user.id !== parseInt(id) && !user.profile.is_public_profile) {
      throw new ForbiddenException('This profile is private');
    }
    
    return user;
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserStatistics(@Request() req: RequestWithUser, @Param('id') id: string): Promise<any> {
    const user = await this.usersService.findById(id);
    
    if (req.user.id !== parseInt(id) && !user.profile.is_public_profile) {
      throw new ForbiddenException('This profile is private');
    }
    
    return this.usersService.getProfileStatistics(id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite user to a match' })
  @ApiParam({ name: 'id', description: 'User ID to invite' })
  async inviteToMatch(@Request() req: RequestWithUser, @Param('id') id: string): Promise<any> {
   
    return { message: 'Invitation sent' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(RolesGuard)
  async getAllUsers(): Promise<any> {
    return this.usersService.findAll();
  }
}