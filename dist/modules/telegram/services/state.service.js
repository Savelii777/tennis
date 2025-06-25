"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateService = void 0;
const common_1 = require("@nestjs/common");
const user_state_interface_1 = require("../interfaces/user-state.interface");
let StateService = class StateService {
    constructor() {
        // В продакшене лучше использовать Redis
        this.userStates = new Map();
    }
    getUserState(userId) {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, {
                step: user_state_interface_1.ProfileStep.IDLE,
                data: {}
            });
        }
        return this.userStates.get(userId);
    }
    setUserState(userId, state) {
        this.userStates.set(userId, state);
    }
    updateUserState(userId, updates) {
        const currentState = this.getUserState(userId);
        const updatedState = {
            step: updates.step !== undefined ? updates.step : currentState.step,
            data: { ...currentState.data, ...(updates.data || {}) }
        };
        this.userStates.set(userId, updatedState);
        return updatedState;
    }
    clearUserState(userId) {
        this.userStates.delete(userId);
    }
};
StateService = __decorate([
    (0, common_1.Injectable)()
], StateService);
exports.StateService = StateService;
