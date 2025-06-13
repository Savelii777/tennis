"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentType = exports.CourtSurface = exports.TrainingState = exports.TrainingType = void 0;
var TrainingType;
(function (TrainingType) {
    TrainingType["WITH_COACH"] = "WITH_COACH";
    TrainingType["WITHOUT_COACH"] = "WITHOUT_COACH";
    TrainingType["TIEBREAK"] = "TIEBREAK";
    TrainingType["SPARRING"] = "SPARRING";
    TrainingType["TECHNIQUE"] = "TECHNIQUE";
})(TrainingType = exports.TrainingType || (exports.TrainingType = {}));
var TrainingState;
(function (TrainingState) {
    TrainingState["OPEN"] = "OPEN";
    TrainingState["FULL"] = "FULL";
    TrainingState["CANCELLED"] = "CANCELLED";
    TrainingState["DONE"] = "DONE";
})(TrainingState = exports.TrainingState || (exports.TrainingState = {}));
var CourtSurface;
(function (CourtSurface) {
    CourtSurface["HARD"] = "HARD";
    CourtSurface["CLAY"] = "CLAY";
    CourtSurface["GRASS"] = "GRASS";
    CourtSurface["CARPET"] = "CARPET";
})(CourtSurface = exports.CourtSurface || (exports.CourtSurface = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["FREE"] = "FREE";
    PaymentType["HOST_PAYS"] = "HOST_PAYS";
    PaymentType["LOSER_PAYS"] = "LOSER_PAYS";
    PaymentType["DIVIDED"] = "DIVIDED";
    PaymentType["FIXED_PRICE"] = "FIXED_PRICE";
})(PaymentType = exports.PaymentType || (exports.PaymentType = {}));
