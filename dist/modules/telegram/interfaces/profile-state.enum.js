"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileStep = void 0;
var ProfileStep;
(function (ProfileStep) {
    ProfileStep["IDLE"] = "idle";
    ProfileStep["AWAITING_FIRST_NAME"] = "awaiting_first_name";
    ProfileStep["AWAITING_LAST_NAME"] = "awaiting_last_name";
    ProfileStep["AWAITING_CITY"] = "awaiting_city";
    ProfileStep["AWAITING_COURT"] = "awaiting_court";
    ProfileStep["AWAITING_HAND"] = "awaiting_hand";
    ProfileStep["AWAITING_FREQUENCY"] = "awaiting_frequency";
    ProfileStep["AWAITING_TOURNAMENTS"] = "awaiting_tournaments";
    ProfileStep["AWAITING_LEVEL"] = "awaiting_level";
    // Заявки на игру
    ProfileStep["CREATING_REQUEST"] = "creating_request";
    ProfileStep["AWAITING_REQUEST_DATETIME"] = "awaiting_request_datetime";
    ProfileStep["AWAITING_REQUEST_LOCATION"] = "awaiting_request_location";
    ProfileStep["AWAITING_REQUEST_LEVEL"] = "awaiting_request_level";
    ProfileStep["AWAITING_REQUEST_DESCRIPTION"] = "awaiting_request_description";
    // Турниры
    ProfileStep["CREATING_TOURNAMENT"] = "creating_tournament";
    ProfileStep["AWAITING_TOURNAMENT_NAME"] = "awaiting_tournament_name";
    ProfileStep["AWAITING_TOURNAMENT_DESCRIPTION"] = "awaiting_tournament_description";
    ProfileStep["AWAITING_TOURNAMENT_START_DATE"] = "awaiting_tournament_start_date";
    ProfileStep["AWAITING_TOURNAMENT_REGISTRATION_END"] = "awaiting_tournament_registration_end";
    ProfileStep["AWAITING_TOURNAMENT_MAX_PARTICIPANTS"] = "awaiting_tournament_max_participants";
    // Матчи
    ProfileStep["RECORDING_MATCH"] = "recording_match";
    ProfileStep["AWAITING_MATCH_OPPONENT"] = "awaiting_match_opponent";
    ProfileStep["AWAITING_MATCH_SCORE"] = "awaiting_match_score";
    ProfileStep["AWAITING_MATCH_DATE"] = "awaiting_match_date";
    ProfileStep["AWAITING_MATCH_TYPE"] = "awaiting_match_type";
    // Stories
    ProfileStep["UPLOADING_STORY"] = "uploading_story";
    ProfileStep["AWAITING_STORY_DESCRIPTION"] = "awaiting_story_description";
    ProfileStep["AWAITING_STORY_MEDIA"] = "awaiting_story_media";
    // Тренировки
    ProfileStep["CREATING_TRAINING"] = "creating_training";
    ProfileStep["AWAITING_TRAINING_TITLE"] = "awaiting_training_title";
    ProfileStep["AWAITING_TRAINING_DATETIME"] = "awaiting_training_datetime";
    ProfileStep["AWAITING_TRAINING_LOCATION"] = "awaiting_training_location";
    ProfileStep["AWAITING_TRAINING_PRICE"] = "awaiting_training_price";
    ProfileStep["AWAITING_TRAINING_MAX_PARTICIPANTS"] = "awaiting_training_max_participants";
    // Поиск локаций
    ProfileStep["AWAITING_CITY_SEARCH"] = "awaiting_city_search";
    // Рефералы
    ProfileStep["PROCESSING_REFERRAL"] = "processing_referral";
    // AI Coach
    ProfileStep["AI_CONSULTATION"] = "ai_consultation";
    ProfileStep["AWAITING_AI_QUESTION"] = "awaiting_ai_question";
})(ProfileStep = exports.ProfileStep || (exports.ProfileStep = {}));
