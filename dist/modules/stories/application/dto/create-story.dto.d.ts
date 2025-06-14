import { MediaType } from '../../domain/enums/media-type.enum';
export declare class CreateStoryDto {
    telegramFileId: string;
    type: MediaType;
    telegramFilePath?: string;
}
