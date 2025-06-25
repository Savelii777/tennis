import { Context } from 'telegraf';
import { BaseBotHandler } from './base-bot.handler';
import { LocationsService } from '../../locations/application/services/locations.service';
export declare class LocationsHandler extends BaseBotHandler {
    private readonly locationsService;
    constructor(usersService: any, ballsService: any, locationsService: LocationsService);
    handleLocations(ctx: Context): Promise<void>;
    handleFindCourts(ctx: Context): Promise<void>;
    handleNearbyCourts(ctx: Context): Promise<void>;
    handlePopularCourts(ctx: Context): Promise<void>;
    handleAddCourt(ctx: Context): Promise<void>;
    handleSpecifyAddress(ctx: Context): Promise<void>;
    handleBackToLocations(ctx: Context): Promise<void>;
    handleCitySearch(ctx: Context, text: string, userId: string, userState: any): Promise<void>;
    handleCityCourts(ctx: Context): Promise<void>;
    handlePopularCities(ctx: Context): Promise<void>;
}
