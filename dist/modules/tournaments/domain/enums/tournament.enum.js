"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatus = exports.TournamentStatus = exports.TournamentType = void 0;
var TournamentType;
(function (TournamentType) {
    TournamentType["SINGLE_ELIMINATION"] = "SINGLE_ELIMINATION";
    TournamentType["GROUPS_PLAYOFF"] = "GROUPS_PLAYOFF";
    TournamentType["LEAGUE"] = "LEAGUE";
    TournamentType["BLITZ"] = "BLITZ";
})(TournamentType || (exports.TournamentType = TournamentType = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["DRAFT"] = "DRAFT";
    TournamentStatus["ACTIVE"] = "ACTIVE";
    TournamentStatus["COMPLETED"] = "COMPLETED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "SCHEDULED";
    MatchStatus["FINISHED"] = "FINISHED";
    MatchStatus["CANCELLED"] = "CANCELLED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
