import { TournamentType, TournamentStatus } from '../enums/tournament.enum';

export class TournamentEntity {
  id: number;
  title: string;
  description?: string;
  type: TournamentType;
  status: TournamentStatus;
  creatorId: number;
  startDate: Date;
  endDate: Date;
  formatDetails: any; 
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  isRanked: boolean;
  locationId?: number;
  locationName?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TournamentEntity>) {
    Object.assign(this, partial);
  }
}