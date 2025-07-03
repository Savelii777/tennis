enum ProfileStep {
  IDLE = 'idle',
  
  // Шаг 1: Основные данные
  AWAITING_SPORT_TYPE = 'awaiting_sport_type',       // Новый первый шаг
  AWAITING_FIRST_NAME = 'awaiting_first_name',
  AWAITING_LAST_NAME = 'awaiting_last_name',
  AWAITING_CITY = 'awaiting_city',
  AWAITING_COURT = 'awaiting_court',
  AWAITING_HAND = 'awaiting_hand',
  AWAITING_PLAY_TIME = 'awaiting_play_time',         // Новый шаг
  AWAITING_FREQUENCY = 'awaiting_frequency',
  AWAITING_TOURNAMENTS = 'awaiting_tournaments',
  
  // Шаг 2: Стиль игры и уровень  
  AWAITING_LEVEL = 'awaiting_level',
  AWAITING_BACKHAND = 'awaiting_backhand',           // Новые шаги для Шага 2
  AWAITING_SURFACE = 'awaiting_surface',
  AWAITING_STYLE = 'awaiting_style', 
  AWAITING_SHOT = 'awaiting_shot',
  AWAITING_RACKET = 'awaiting_racket',
  AWAITING_OPPONENT_PREF = 'awaiting_opponent_pref',
  
  COMPLETE = 'complete',
  
  // Сообщения
  AWAITING_MESSAGE_TEXT = 'awaiting_message_text',
  
  // Заявки
  CREATING_REQUEST = 'creating_request',
  AWAITING_REQUEST_DATETIME = 'awaiting_request_datetime',
  AWAITING_REQUEST_LOCATION = 'awaiting_request_location',
  AWAITING_REQUEST_LEVEL = 'awaiting_request_level',
  AWAITING_REQUEST_DESCRIPTION = 'awaiting_request_description',
  
  // Турниры
  CREATING_TOURNAMENT = 'creating_tournament',
  AWAITING_TOURNAMENT_NAME = 'awaiting_tournament_name',
  AWAITING_TOURNAMENT_DESCRIPTION = 'awaiting_tournament_description',
  AWAITING_TOURNAMENT_START_DATE = 'awaiting_tournament_start_date',
  AWAITING_TOURNAMENT_REGISTRATION_END = 'awaiting_tournament_registration_end',
  AWAITING_TOURNAMENT_MAX_PARTICIPANTS = 'awaiting_tournament_max_participants',
  
  // Матчи
  RECORDING_MATCH = 'recording_match',
  AWAITING_MATCH_OPPONENT = 'awaiting_match_opponent',
  AWAITING_MATCH_SCORE = 'awaiting_match_score',
  AWAITING_MATCH_DATE = 'awaiting_match_date',
  AWAITING_MATCH_TYPE = 'awaiting_match_type',
  
  // Истории
  UPLOADING_STORY = 'uploading_story',
  AWAITING_STORY_DESCRIPTION = 'awaiting_story_description', // Исправлено на нижний регистр
  AWAITING_STORY_MEDIA = 'awaiting_story_media',
  
  // Тренировки
  CREATING_TRAINING = 'creating_training',
  AWAITING_TRAINING_TITLE = 'awaiting_training_title',
  AWAITING_TRAINING_DATETIME = 'awaiting_training_datetime',
  AWAITING_TRAINING_LOCATION = 'awaiting_training_location',
  AWAITING_TRAINING_PRICE = 'awaiting_training_price',
  AWAITING_TRAINING_MAX_PARTICIPANTS = 'awaiting_training_max_participants',
  
  // Поиск
  AWAITING_CITY_SEARCH = 'awaiting_city_search',
  
  // Реферальная программа
  PROCESSING_REFERRAL = 'processing_referral',
  
  // AI консультации
  AI_CONSULTATION = 'ai_consultation',
  AWAITING_AI_QUESTION = 'awaiting_ai_question',
}

interface UserState {
  step: ProfileStep;
  page?: string;
  waitingForMessage?: string;  // Добавляем поле для ожидания сообщения
  data: {
    // ШАГ 1: Основные данные профиля
    firstName?: string;
    lastName?: string;
    city?: string;
    preferredCourt?: string;
    sportType?: 'TENNIS' | 'PADEL';                    // Новое поле
    dominantHand?: 'LEFT' | 'RIGHT';
    preferredPlayTime?: string[];                      // Массив времен игры
    weeklyPlayFrequency?: 'ONE' | 'TWO_THREE' | 'FOUR_PLUS';  // Обновленные значения
    playsInTournaments?: boolean;
    
    // ШАГ 2: Стиль игры и уровень
    selfAssessedLevel?: 'BEGINNER' | 'AMATEUR' | 'CONFIDENT' | 'TOURNAMENT' | 'SEMI_PRO';
    backhandType?: 'ONE_HANDED' | 'TWO_HANDED';       // Новое поле
    preferredSurface?: 'HARD' | 'CLAY' | 'GRASS' | 'CARPET';  // Новое поле
    playingStyle?: 'UNIVERSAL' | 'DEFENSIVE' | 'AGGRESSIVE' | 'NET_PLAYER' | 'BASIC';  // Новое поле
    favoriteShot?: 'SERVE' | 'FOREHAND' | 'BACKHAND' | 'VOLLEY' | 'SMASH';  // Новое поле
    racket?: string;                                   // Новое поле
    opponentPreference?: 'ANY' | 'MEN' | 'WOMEN' | 'SAME_LEVEL' | 'STRONGER' | 'WEAKER';  // Новое поле
    
    // Остальные существующие поля
    birthDate?: string;
    phoneNumber?: string;
    email?: string;
    username?: string;
    password?: string;

    // Данные для работы со stories
    fileId?: string;
    fileType?: string;
    storyMediaId?: string;
    storyDescription?: string;
    storyType?: 'PHOTO' | 'VIDEO';
    
    // Данные для матчей
    matchOpponent?: string;
    matchOpponentId?: number;
    matchScore?: string;
    matchDate?: string;
    matchType?: 'SINGLES' | 'DOUBLES';
    matchResult?: 'WIN' | 'LOSS';
    
    // Заявки на игру
    requestType?: 'SINGLES' | 'DOUBLES' | 'MIXED';
    requestDateTime?: string;
    requestLocation?: string;
    requestLevel?: string;
    requestDescription?: string;
    
    // Турниры
    tournamentName?: string;
    tournamentDescription?: string;
    tournamentStartDate?: string;
    tournamentRegistrationEnd?: string;
    tournamentMaxParticipants?: number;
    tournamentFormat?: string;
    tournamentEntryFee?: number;
    
    // Тренировки
    trainingTitle?: string;
    trainingDateTime?: string;
    trainingLocation?: string;
    trainingPrice?: number;
    trainingMaxParticipants?: number;
    trainingDescription?: string;
    
    // Поиск
    searchCity?: string;
    aiQuestion?: string;
    
    // Сообщения
    targetUserId?: string;
    targetUserName?: string;
    
    // Идентификаторы для внутреннего использования
    currentRequestId?: string;
    currentTournamentId?: string;
    selectedMatchId?: string;
    selectedTrainingId?: string;
    pageNumber?: number;
    lastMessageId?: number;
  };
}
export { ProfileStep, UserState };