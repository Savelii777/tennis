export enum ProfileStep {
  IDLE = 'idle',
  AWAITING_FIRST_NAME = 'awaiting_first_name',
  AWAITING_LAST_NAME = 'awaiting_last_name',
  AWAITING_CITY = 'awaiting_city',
  AWAITING_COURT = 'awaiting_court',
  AWAITING_HAND = 'awaiting_hand',
  AWAITING_FREQUENCY = 'awaiting_frequency',
  AWAITING_TOURNAMENTS = 'awaiting_tournaments',
  AWAITING_LEVEL = 'awaiting_level',
  
  CREATING_REQUEST = 'creating_request',
  AWAITING_REQUEST_DATETIME = 'awaiting_request_datetime',
  AWAITING_REQUEST_LOCATION = 'awaiting_request_location',
  AWAITING_REQUEST_LEVEL = 'awaiting_request_level',
  AWAITING_REQUEST_DESCRIPTION = 'awaiting_request_description',
  
  CREATING_TOURNAMENT = 'creating_tournament',
  AWAITING_TOURNAMENT_NAME = 'awaiting_tournament_name',
  AWAITING_TOURNAMENT_DESCRIPTION = 'awaiting_tournament_description',
  AWAITING_TOURNAMENT_START_DATE = 'awaiting_tournament_start_date',
  AWAITING_TOURNAMENT_REGISTRATION_END = 'awaiting_tournament_registration_end',
  AWAITING_TOURNAMENT_MAX_PARTICIPANTS = 'awaiting_tournament_max_participants',
  
  RECORDING_MATCH = 'recording_match',
  AWAITING_MATCH_OPPONENT = 'awaiting_match_opponent',
  AWAITING_MATCH_SCORE = 'awaiting_match_score',
  AWAITING_MATCH_DATE = 'awaiting_match_date',
  AWAITING_MATCH_TYPE = 'awaiting_match_type',
  
  UPLOADING_STORY = 'uploading_story',
  AWAITING_STORY_DESCRIPTION = 'awaiting_story_description',
  AWAITING_STORY_MEDIA = 'awaiting_story_media',
  
  CREATING_TRAINING = 'creating_training',
  AWAITING_TRAINING_TITLE = 'awaiting_training_title',
  AWAITING_TRAINING_DATETIME = 'awaiting_training_datetime',
  AWAITING_TRAINING_LOCATION = 'awaiting_training_location',
  AWAITING_TRAINING_PRICE = 'awaiting_training_price',
  AWAITING_TRAINING_MAX_PARTICIPANTS = 'awaiting_training_max_participants',
  
  AWAITING_CITY_SEARCH = 'awaiting_city_search',
  
  PROCESSING_REFERRAL = 'processing_referral',
  
  AI_CONSULTATION = 'ai_consultation',
  AWAITING_AI_QUESTION = 'awaiting_ai_question',
}

export interface UserState {
  step: ProfileStep;
  data: {
    firstName?: string;
    lastName?: string;
    city?: string;
    preferredCourt?: string;
    dominantHand?: 'LEFT' | 'RIGHT';
    weeklyPlayFrequency?: 'ONCE' | 'TWICE' | 'THREE_TIMES' | 'FOUR_PLUS';
    playsInTournaments?: boolean;
    selfAssessedLevel?: 'BEGINNER' | 'AMATEUR' | 'CONFIDENT' | 'TOURNAMENT' | 'SEMI_PRO';
    preferredPlayTime?: string[];
    
    requestDateTime?: string;
    requestLocation?: string;
    requestLevel?: string;
    requestDescription?: string;
    requestType?: 'SINGLES' | 'DOUBLES' | 'MIXED';
    
    tournamentName?: string;
    tournamentDescription?: string;
    tournamentStartDate?: string;
    tournamentRegistrationEnd?: string;
    tournamentMaxParticipants?: number;
    tournamentFormat?: string;
    tournamentEntryFee?: number;
    
    matchOpponent?: string;
    matchScore?: string;
    matchDate?: string;
    matchType?: 'SINGLES' | 'DOUBLES';
    matchResult?: 'WIN' | 'LOSS';
    
    storyMediaId?: string;
    storyDescription?: string;
    storyType?: 'PHOTO' | 'VIDEO';
    
    trainingTitle?: string;
    trainingDateTime?: string;
    trainingLocation?: string;
    trainingPrice?: number;
    trainingMaxParticipants?: number;
    trainingDescription?: string;
    
    searchCity?: string;
    aiQuestion?: string;
    
    currentRequestId?: string;
    currentTournamentId?: string;
    selectedMatchId?: string;
    selectedTrainingId?: string;
    pageNumber?: number;
    lastMessageId?: number;
  };
}