"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const requests_repository_1 = require("../../infrastructure/repositories/requests.repository");
const request_type_enum_1 = require("../../domain/enums/request-type.enum");
let RequestsService = class RequestsService {
    constructor(requestsRepository) {
        this.requestsRepository = requestsRepository;
    }
    async findAll(filters) {
        return this.requestsRepository.findAll(filters);
    }
    async findById(id) {
        const request = await this.requestsRepository.findById(id);
        if (!request) {
            throw new common_1.NotFoundException(`Request with ID ${id} not found`);
        }
        return request;
    }
    async create(userId, createRequestDto) {
        return this.requestsRepository.create(userId, createRequestDto);
    }
    async respond(requestId, userId, respondDto) {
        const request = await this.findById(requestId);
        if (request.creatorId === parseInt(userId)) {
            throw new common_1.BadRequestException('You cannot respond to your own request');
        }
        if (request.status !== request_type_enum_1.RequestStatus.OPEN) {
            throw new common_1.BadRequestException('This request is not open for responses');
        }
        if (request.currentPlayers >= request.maxPlayers) {
            throw new common_1.BadRequestException('This request is already full');
        }
        return this.requestsRepository.respond(requestId, userId, respondDto);
    }
    async acceptResponse(requestId, responseId, userId) {
        const request = await this.findById(requestId);
        if (request.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('Only request creator can accept responses');
        }
        if (request.currentPlayers >= request.maxPlayers) {
            throw new common_1.BadRequestException('This request is already full');
        }
        return this.requestsRepository.updateResponseStatus(responseId, request_type_enum_1.ResponseStatus.ACCEPTED);
    }
    async declineResponse(requestId, responseId, userId) {
        const request = await this.findById(requestId);
        if (request.creatorId !== parseInt(userId)) {
            throw new common_1.ForbiddenException('Only request creator can decline responses');
        }
        return this.requestsRepository.updateResponseStatus(responseId, request_type_enum_1.ResponseStatus.DECLINED);
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [requests_repository_1.RequestsRepository])
], RequestsService);
