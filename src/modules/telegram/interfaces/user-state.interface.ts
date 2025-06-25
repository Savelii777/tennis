import { ProfileStep } from './profile-state.enum';

interface UserState {
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
  };
}

export { ProfileStep, UserState };