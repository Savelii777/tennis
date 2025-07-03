import { Context, Telegraf } from 'telegraf';
import { StateService } from '../services/state.service';
import { KeyboardService } from '../services/keyboard.service';
import { UsersService } from '../../users/application/services/users.service';
import { RatingsService } from '../../ratings/ratings.service';
import { BallsService } from '../../users/application/services/balls.service';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class ProfileHandler {
    private readonly stateService;
    private readonly keyboardService;
    private readonly usersService;
    private readonly ratingsService;
    private readonly ballsService;
    private readonly prisma;
    private readonly logger;
    constructor(stateService: StateService, keyboardService: KeyboardService, usersService: UsersService, ratingsService: RatingsService, ballsService: BallsService, prisma: PrismaService);
    register(bot: Telegraf<Context>): void;
    handleProfile(ctx: Context): Promise<void>;
    handleDetailedStats(ctx: Context): Promise<void>;
    handleUserAchievements(ctx: Context): Promise<void>;
    handleSetupProfileAction(ctx: Context): Promise<void>;
    handleTournamentsSelection(participates: boolean, ctx: Context): Promise<void>;
    handleLevelSelection(level: string, ctx: Context): Promise<void>;
    /**
     * Метод для сохранения данных профиля
     */
    completeProfileSetup(telegramUserId: string, profileData: any): Promise<void>;
    handleMatchHistory(ctx: Context): Promise<void>;
    handleUserGoals(ctx: Context): Promise<void>;
    handleBackToProfile(ctx: Context): Promise<void>;
    handleSettings(ctx: Context): Promise<void>;
    private getLevelText;
    private getDominantHandText;
    handleFrequencySelection(frequency: string, ctx: Context): Promise<void>;
    handleProfileInput(ctx: Context, text: string, userId: string): Promise<boolean>;
    processFrequencySelection(frequency: string, ctx: Context, userId: string, userState: any): Promise<boolean>;
    handleCity(ctx: Context, text: string, userId: string, userState: any): Promise<boolean>;
    handleCourt(ctx: Context, text: string, userId: string, userState: any): Promise<boolean>;
    handleHandSelection(hand: 'LEFT' | 'RIGHT', ctx: Context): Promise<void>;
    private handleFrequency;
    private handleTournaments;
    private handleLevel;
    formatProfileMessage(user: any): Promise<string>;
    handleProfileCommand(ctx: Context): Promise<void>;
    /**
       * НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ДВУХШАГОВОЙ РЕГИСТРАЦИИ
       * Полное соответствие ТЗ
       */
    /**
     * Обработчик выбора спорта
     */
    handleSportSelection(sportType: string, ctx: Context): Promise<void>;
    /**
     * Обработчик выбора времени игры
     */
    handlePlayTimeSelection(timeSlot: string, ctx: Context): Promise<void>;
    /**
     * Обработчик кнопки продолжения к частоте игр
     */
    handleContinueToFrequency(ctx: Context): Promise<void>;
    /**
     * Обработчик выбора бэкхенда
     */
    handleBackhandSelection(backhandType: string, ctx: Context): Promise<void>;
    /**
     * Обработчик выбора покрытия
     */
    handleSurfaceSelection(surface: string, ctx: Context): Promise<void>;
    /**
     * Обработчик выбора стиля игры
     */
    handleStyleSelection(style: string, ctx: Context): Promise<void>;
    /**
     * Обработчик выбора любимого удара
     */
    handleShotSelection(shot: string, ctx: Context): Promise<void>;
    /**
     * Обработчик выбора предпочтений по сопернику
     */
    handleOpponentSelection(preference: string, ctx: Context): Promise<void>;
    /**
     * Обработчик текстовых сообщений для всех этапов регистрации
     */
    handleTextMessage(ctx: Context): Promise<void>;
    /**
     * Обработчик ввода города
     */
    handleCityInput(city: string, ctx: Context): Promise<void>;
    /**
     * Обработчик ввода корта
     */
    handleCourtInput(court: string, ctx: Context): Promise<void>;
    /**
     * Обработчик ввода ракетки
     */
    handleRacketInput(racket: string, ctx: Context): Promise<void>;
    /**
     * НОВЫЙ МЕТОД сохранения профиля с ПОЛНЫМИ данными согласно ТЗ
     */
    completeProfileSetupNew(telegramUserId: string, profileData: any): Promise<void>;
    /**
     * Обновленный обработчик перехода к Шагу 2 после завершения турниров
     */
    handleStartStepTwo(ctx: Context): Promise<void>;
    /**
     * Обновленный обработчик выбора уровня для Шага 2
     */
    handleLevelSelectionStepTwo(level: string, ctx: Context): Promise<void>;
    /**
     * Просмотр чужого профиля (публичная версия)
     */
    handlePublicProfile(ctx: Context, targetUserId: string): Promise<void>;
    /**
     * Форматирование сообщения для публичного профиля
     */
    private formatPublicProfileMessage;
    /**
     * Обработчик для кнопки "Сыграть с игроком"
     */
    handlePlayWithPlayer(ctx: Context, targetUserId: string): Promise<void>;
    /**
     * Обработчик для кнопки "Написать"
     */
    handleMessagePlayer(ctx: Context, targetUserId: string): Promise<void>;
    /**
     * Обработчик для кнопки "Пожаловаться"
     */
    handleReportPlayer(ctx: Context, targetUserId: string): Promise<void>;
    /**
     * Обработчик отправки сообщения другому пользователю
     */
    handleSendDirectMessage(ctx: Context, messageText: string): Promise<void>;
}
