"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchState = exports.MatchType = void 0;
var MatchType;
(function (MatchType) {
    MatchType["ONE_ON_ONE"] = "ONE_ON_ONE";
    MatchType["DOUBLES"] = "DOUBLES";
})(MatchType || (exports.MatchType = MatchType = {}));
var MatchState;
(function (MatchState) {
    MatchState["DRAFT"] = "DRAFT";
    MatchState["PENDING"] = "PENDING";
    MatchState["CONFIRMED"] = "CONFIRMED";
    MatchState["FINISHED"] = "FINISHED";
    MatchState["CANCELLED"] = "CANCELLED";
})(MatchState || (exports.MatchState = MatchState = {}));
