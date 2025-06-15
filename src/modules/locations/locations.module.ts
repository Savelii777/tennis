import { Module } from '@nestjs/common';
import { LocationsController } from './presentation/locations.controller';
import { LocationsService } from './application/services/locations.service';
import { LocationsRepository } from './infrastructure/repositories/locations.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository, PrismaService],
  exports: [LocationsService],
})
export class LocationsModule {}