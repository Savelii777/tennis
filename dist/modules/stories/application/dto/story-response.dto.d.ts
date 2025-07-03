export declare class StoryUserDto {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    avatar?: string;
}
export declare class StoryResponseDto {
    id: number;
    userId: number;
    user?: StoryUserDto;
    type: string;
    status: string;
    caption?: string;
    viewsCount: number;
    likesCount: number;
    createdAt: Date;
    publishedAt?: Date;
    fileUrl?: string;
}
