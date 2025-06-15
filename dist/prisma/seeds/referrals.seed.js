"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedReferrals = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedReferrals() {
    console.log('🔗 Seeding referrals...');
    // Получаем существующих пользователей
    const users = await prisma.user.findMany({
        take: 10,
        orderBy: { id: 'asc' }
    });
    if (users.length < 3) {
        console.log('Недостаточно пользователей для создания рефералов');
        return;
    }
    // Создаем реферальные коды для первых 3 пользователей
    for (let i = 0; i < 3; i++) {
        const user = users[i];
        const referralCode = `REF${user.id.toString().padStart(3, '0')}`;
        await prisma.user.update({
            where: { id: user.id },
            data: { referralCode }
        });
        console.log(`Создан реферальный код ${referralCode} для пользователя ${user.username}`);
    }
    // Создаем реферальную активность
    const referrer = users[0]; // Первый пользователь - реферер
    const now = new Date();
    // Создаем несколько рефералов для демонстрации
    for (let i = 3; i < Math.min(8, users.length); i++) {
        const referredUser = users[i];
        // Обновляем пользователя как приглашенного
        await prisma.user.update({
            where: { id: referredUser.id },
            data: { referredBy: referrer.id }
        });
        // Создаем активность реферала
        const registeredAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const isActive = Math.random() > 0.3; // 70% активных
        await prisma.referralActivity.create({
            data: {
                referrerId: referrer.id,
                invitedUserId: referredUser.id,
                registeredAt,
                isActive,
                firstMatchAt: isActive ? new Date(registeredAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
                inviteSource: ['telegram', 'whatsapp', 'direct'][Math.floor(Math.random() * 3)],
            }
        });
    }
    // Создаем статистику для реферера
    const referralCount = await prisma.referralActivity.count({
        where: { referrerId: referrer.id }
    });
    const activeCount = await prisma.referralActivity.count({
        where: {
            referrerId: referrer.id,
            isActive: true
        }
    });
    await prisma.referralStats.create({
        data: {
            userId: referrer.id,
            totalInvited: referralCount,
            activeInvited: activeCount,
            registeredToday: 0,
            registeredThisWeek: 2,
            registeredThisMonth: referralCount,
            achievementsEarned: referralCount >= 5 ? ['FIRST_INVITE', 'SOCIAL_BUTTERFLY'] : ['FIRST_INVITE'],
            bonusPointsEarned: referralCount * 10,
        }
    });
    console.log('✅ Referrals seeded successfully!');
}
exports.seedReferrals = seedReferrals;
