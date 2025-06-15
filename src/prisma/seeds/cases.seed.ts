import { PrismaClient, CaseItemType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCases() {
  console.log('🎁 Seeding cases...');

  // Создаем кейсы
  const basicCase = await prisma.case.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Обычный кейс',
      description: 'Кейс с базовыми призами для начинающих игроков',
      priceBalls: 100,
      image: 'https://example.com/cases/basic-case.jpg',
      isActive: true,
    },
  });

  const premiumCase = await prisma.case.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Премиум кейс',
      description: 'Эксклюзивный кейс с редкими призами',
      priceBalls: 250,
      image: 'https://example.com/cases/premium-case.jpg',
      isActive: true,
    },
  });

  const holidayCase = await prisma.case.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Праздничный кейс',
      description: 'Специальный праздничный кейс с уникальными призами',
      priceBalls: 200,
      image: 'https://example.com/cases/holiday-case.jpg',
      isActive: false, // Неактивен для демонстрации
    },
  });

  console.log('🎁 Creating case items...');

  // Призы для обычного кейса
  const basicCaseItems = [
    {
      name: '+50 теннисных мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 50 },
      dropChance: 0.30,
      imageUrl: 'https://example.com/items/balls-50.jpg',
    },
    {
      name: '+25 теннисных мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 25 },
      dropChance: 0.35,
      imageUrl: 'https://example.com/items/balls-25.jpg',
    },
    {
      name: 'Бейдж "Новичок" на 7 дней',
      type: CaseItemType.VIRTUAL,
      payload: { badge_id: 'novice', duration_days: 7 },
      dropChance: 0.15,
      imageUrl: 'https://example.com/items/badge-novice.jpg',
    },
    {
      name: 'Мем-картинка утешения',
      type: CaseItemType.ACTION,
      payload: { meme: true, meme_id: 'consolation' },
      dropChance: 0.20,
      imageUrl: 'https://example.com/items/meme-consolation.jpg',
    },
  ];

  for (const item of basicCaseItems) {
    await prisma.caseItem.create({
      data: {
        caseId: basicCase.id,
        ...item,
      },
    });
  }

  // Призы для премиум кейса
  const premiumCaseItems = [
    {
      name: '+100 теннисных мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 100 },
      dropChance: 0.25,
      imageUrl: 'https://example.com/items/balls-100.jpg',
    },
    {
      name: 'Бесплатный вход в турнир',
      type: CaseItemType.ACTION,
      payload: { tournament_access: true, tournaments_count: 1 },
      dropChance: 0.10,
      imageUrl: 'https://example.com/items/tournament-access.jpg',
    },
    {
      name: 'Уникальный бейдж "Чемпион"',
      type: CaseItemType.VIRTUAL,
      payload: { badge_id: 'champion', permanent: true },
      dropChance: 0.05,
      imageUrl: 'https://example.com/items/badge-champion.jpg',
    },
    {
      name: 'Футболка с логотипом (размер M)',
      type: CaseItemType.PHYSICAL,
      payload: { sku: 'tshirt_m', size: 'M', color: 'white' },
      dropChance: 0.08,
      imageUrl: 'https://example.com/items/tshirt.jpg',
    },
    {
      name: 'Сертификат Ozon 1000₽',
      type: CaseItemType.PHYSICAL,
      payload: { platform: 'ozon', amount: 1000, currency: 'RUB' },
      dropChance: 0.02,
      imageUrl: 'https://example.com/items/ozon-certificate.jpg',
    },
    {
      name: '+75 теннисных мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 75 },
      dropChance: 0.30,
      imageUrl: 'https://example.com/items/balls-75.jpg',
    },
    {
      name: 'Скидка 50% на следующий кейс',
      type: CaseItemType.ACTION,
      payload: { discount: 0.5, valid_days: 30 },
      dropChance: 0.20,
      imageUrl: 'https://example.com/items/discount.jpg',
    },
  ];

  for (const item of premiumCaseItems) {
    await prisma.caseItem.create({
      data: {
        caseId: premiumCase.id,
        ...item,
      },
    });
  }

  // Призы для праздничного кейса
  const holidayCaseItems = [
    {
      name: '+200 теннисных мячей (праздничный бонус)',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 200, holiday_bonus: true },
      dropChance: 0.15,
      imageUrl: 'https://example.com/items/balls-holiday.jpg',
    },
    {
      name: 'Праздничный бейдж "Новый год"',
      type: CaseItemType.VIRTUAL,
      payload: { badge_id: 'new_year', special: true },
      dropChance: 0.20,
      imageUrl: 'https://example.com/items/badge-newyear.jpg',
    },
    {
      name: 'Эксклюзивная кружка',
      type: CaseItemType.PHYSICAL,
      payload: { sku: 'mug_holiday', design: 'tennis_2025' },
      dropChance: 0.10,
      imageUrl: 'https://example.com/items/holiday-mug.jpg',
    },
    {
      name: 'Праздничный мем',
      type: CaseItemType.ACTION,
      payload: { meme: true, meme_id: 'holiday_cheer' },
      dropChance: 0.55,
      imageUrl: 'https://example.com/items/holiday-meme.jpg',
    },
  ];

  for (const item of holidayCaseItems) {
    await prisma.caseItem.create({
      data: {
        caseId: holidayCase.id,
        ...item,
      },
    });
  }

  console.log('✅ Cases seeded successfully!');
}