"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementEventType = exports.AchievementCategory = void 0;
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["ACTIVITY"] = "activity";
    AchievementCategory["MATCHES"] = "matches";
    AchievementCategory["VICTORIES"] = "victories";
    AchievementCategory["TOURNAMENTS"] = "tournaments";
    AchievementCategory["SOCIAL"] = "social";
    AchievementCategory["SKILLS"] = "skills";
    AchievementCategory["SPECIAL"] = "special";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
var AchievementEventType;
(function (AchievementEventType) {
    AchievementEventType["REGISTRATION_COMPLETED"] = "registration_completed";
    AchievementEventType["MATCH_PLAYED"] = "match_played";
    AchievementEventType["MATCH_WON"] = "match_won";
    AchievementEventType["TOURNAMENT_PARTICIPATED"] = "tournament_participated";
    AchievementEventType["TOURNAMENT_WON"] = "tournament_won";
    AchievementEventType["MESSAGE_SENT"] = "message_sent";
    AchievementEventType["REFERRAL_REGISTERED"] = "referral_registered";
    AchievementEventType["LOGIN"] = "login";
})(AchievementEventType || (exports.AchievementEventType = AchievementEventType = {}));
