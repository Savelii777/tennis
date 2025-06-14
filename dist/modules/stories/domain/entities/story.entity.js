"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryEntity = void 0;
const story_status_enum_1 = require("../enums/story-status.enum");
class StoryEntity {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.telegramFileId = data.telegramFileId;
        this.telegramFilePath = data.telegramFilePath;
        this.type = data.type;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.publishedAt = data.publishedAt;
        this.updatedAt = data.updatedAt;
    }
    approve() {
        this.status = story_status_enum_1.StoryStatus.APPROVED;
        this.publishedAt = new Date();
    }
    reject() {
        this.status = story_status_enum_1.StoryStatus.REJECTED;
    }
    isApproved() {
        return this.status === story_status_enum_1.StoryStatus.APPROVED;
    }
    isPending() {
        return this.status === story_status_enum_1.StoryStatus.PENDING;
    }
    getFileUrl(botToken) {
        if (!this.telegramFilePath)
            return null;
        return `https://api.telegram.org/file/bot${botToken}/${this.telegramFilePath}`;
    }
}
exports.StoryEntity = StoryEntity;
