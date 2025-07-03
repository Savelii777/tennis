"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingType = exports.PaymentType = exports.ResponseStatus = exports.RequestStatus = exports.RequestType = void 0;
var RequestType;
(function (RequestType) {
    RequestType["SINGLE_GAME"] = "SINGLE_GAME";
    RequestType["TOURNAMENT"] = "TOURNAMENT";
    RequestType["TRAINING"] = "TRAINING";
})(RequestType || (exports.RequestType = RequestType = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["OPEN"] = "OPEN";
    RequestStatus["CLOSED"] = "CLOSED";
    RequestStatus["CANCELLED"] = "CANCELLED";
    RequestStatus["DONE"] = "DONE";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["PENDING"] = "PENDING";
    ResponseStatus["ACCEPTED"] = "ACCEPTED";
    ResponseStatus["DECLINED"] = "DECLINED";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["FREE"] = "FREE";
    PaymentType["HOST_PAYS"] = "HOST_PAYS";
    PaymentType["LOSER_PAYS"] = "LOSER_PAYS";
    PaymentType["DIVIDED"] = "DIVIDED";
    PaymentType["FIXED_PRICE"] = "FIXED_PRICE";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var RatingType;
(function (RatingType) {
    RatingType["RATED"] = "RATED";
    RatingType["UNRATED"] = "UNRATED";
})(RatingType || (exports.RatingType = RatingType = {}));
