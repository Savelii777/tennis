import { MediaType } from '@prisma/client';
export declare class CreateStoryDto {
    telegramFileId: string;
    type: MediaType;
    caption?: string;
}
