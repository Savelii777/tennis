import { UserState } from '../interfaces/profile-state.enum';
export declare class StateService {
    private userStates;
    getUserState(userId: string): UserState;
    setUserState(userId: string, state: UserState): void;
    updateUserState(userId: string, updates: Partial<UserState>): UserState;
    clearUserState(userId: string): void;
}
