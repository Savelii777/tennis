import { Injectable } from '@nestjs/common';
import { ProfileStep, UserState } from '../interfaces/user-state.interface';

@Injectable()
export class StateService {
  // В продакшене лучше использовать Redis
  private userStates = new Map<string, UserState>();

  getUserState(userId: string): UserState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, { 
        step: ProfileStep.IDLE,
        data: {} 
      });
    }
    return this.userStates.get(userId)!;
  }

  setUserState(userId: string, state: UserState) {
    this.userStates.set(userId, state);
  }

  updateUserState(userId: string, updates: Partial<UserState>) {
    const currentState = this.getUserState(userId);
    
    const updatedState: UserState = {
      step: updates.step !== undefined ? updates.step : currentState.step,
      data: { ...currentState.data, ...(updates.data || {}) }
    };
    
    this.userStates.set(userId, updatedState);
    return updatedState;
  }

  clearUserState(userId: string) {
    this.userStates.delete(userId);
  }
}