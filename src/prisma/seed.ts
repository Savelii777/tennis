import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('Seed');

async function main() {
  logger.log('🌱 Начинаем заполнение базы данных...');
  
  try {
    // Очищаем существующие данные в правильном порядке (учитывая foreign keys)
    logger.log('🧹 Очистка существующих данных...');
    await cleanDatabase();
    
    // Создаем пользователей
    logger.log('👥 Создание пользователей...');
    const users = await createUsers();
    
    // Создаем локации
    logger.log('📍 Создание локаций...');
    const locations = await createLocations();
    
    // Создаем заявки на игру
    logger.log('🎾 Создание заявок на игру...');
    await createGameRequests(users);
    
    // Создаем матчи
    logger.log('⚡ Создание матчей...');
    await createMatches(users);
    
    // Создаем турниры
    logger.log('🏆 Создание турниров...');
    const tournaments = await createTournaments(users);
    
    // Создаем тренировки
    logger.log('🏃‍♂️ Создание тренировок...');
    await createTrainings(users);
    
    // Создаем кейсы и призы
    logger.log('🎁 Создание кейсов...');
    await createCases();
    
    // Создаем stories
    logger.log('📱 Создание stories...');
    await createStories(users);
    
    // Создаем рефералы
    logger.log('🔗 Создание рефералов...');
    await createReferrals(users);
    
    logger.log('✅ База данных успешно заполнена!');
    logger.log('');
    logger.log('📋 Тестовые аккаунты для входа через API:');
    logger.log('👑 Админ: telegram_id = "777888999", username = "admin"');
    logger.log('🏆 Организатор: telegram_id = "555666777", username = "organizer"');
    logger.log('👤 Пользователь: telegram_id = "123456789", username = "test_user"');
    logger.log('');
    logger.log('🔗 Полезные ссылки:');
    logger.log('📚 API Docs: http://localhost:3000/api');
    logger.log('🔧 Auth Helper: http://localhost:3000/api/auth-helper');
    
  } catch (error) {
    logger.error('❌ Ошибка заполнения базы данных:', error);
    throw error;
  }
}

async function cleanDatabase() {
  // Порядок важен из-за foreign key constraints
  await prisma.referralActivity.deleteMany();
  await prisma.caseOpening.deleteMany();
  await prisma.caseWinning.deleteMany();
  await prisma.caseItem.deleteMany();
  await prisma.case.deleteMany();
  await prisma.story.deleteMany();
  await prisma.trainingRegistration.deleteMany();
  await prisma.training.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.match.deleteMany();
  await prisma.gameRequest.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
}

async function createUsers() {
  logger.log('Создание администратора...');
  const admin = await prisma.user.create({
    data: {
      telegram_id: '777888999',
      username: 'admin',
      first_name: 'Admin',
      last_name: 'System',
      role: 'ADMIN',
      referral_code: 'ADMIN001',
      profile: {
        create: {
          avatar_url: 'https://avatars.githubusercontent.com/u/admin',
          city: 'Москва',
          rating_points: 2000,
          matches_played: 150,
          match_wins: 120,
          match_losses: 30,
          tournaments_played: 25,
          tournaments_won: 20
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание организатора...');
  const organizer = await prisma.user.create({
    data: {
      telegram_id: '555666777',
      username: 'organizer',
      first_name: 'Tournament',
      last_name: 'Organizer',
      role: 'ORGANIZER',
      referral_code: 'ORG001',
      profile: {
        create: {
          avatar_url: 'https://avatars.githubusercontent.com/u/organizer',
          city: 'Санкт-Петербург',
          rating_points: 1850,
          matches_played: 100,
          match_wins: 75,
          match_losses: 25,
          tournaments_played: 15,
          tournaments_won: 8
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание тестового пользователя...');
  const testUser = await prisma.user.create({
    data: {
      telegram_id: '123456789',
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      role: 'USER',
      referral_code: 'USER001',
      profile: {
        create: {
          avatar_url: 'https://avatars.githubusercontent.com/u/testuser',
          city: 'Москва',
          rating_points: 1200,
          matches_played: 45,
          match_wins: 28,
          match_losses: 17,
          tournaments_played: 5,
          tournaments_won: 2
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание обычных игроков...');
  const players = [];
  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];
  const firstNames = ['Алексей', 'Дмитрий', 'Андрей', 'Сергей', 'Максим', 'Иван', 'Артем', 'Никита', 'Роман', 'Владимир'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Волков', 'Смирнов', 'Попов', 'Лебедев', 'Новиков', 'Морозов'];

  for (let i = 1; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    const player = await prisma.user.create({
      data: {
        telegram_id: `100000000${i.toString().padStart(2, '0')}`,
        username: `player${i}`,
        first_name: firstName,
        last_name: lastName,
        role: 'USER',
        referral_code: `PLR${i.toString().padStart(3, '0')}`,
        profile: {
          create: {
            avatar_url: `https://avatars.githubusercontent.com/u/player${i}`,
            city: city,
            rating_points: 800 + (i * 20) + Math.floor(Math.random() * 200),
            matches_played: 10 + Math.floor(Math.random() * 40),
            match_wins: Math.floor((10 + Math.random() * 40) * 0.6),
            match_losses: Math.floor((10 + Math.random() * 40) * 0.4),
            tournaments_played: Math.floor(i / 5) + Math.floor(Math.random() * 3),
            tournaments_won: Math.floor(i / 15) + (Math.random() > 0.7 ? 1 : 0)
          }
        }
      },
      include: { profile: true }
    });
    players.push(player);
  }

  return { admin, organizer, testUser, players };
}

async function createLocations() {
  const locations = [
    {
      name: 'Теннисный центр "Олимпийский"',
      address: 'Олимпийский проспект, 16, Москва',
      city: 'Москва',
      latitude: 55.7839,
      longitude: 37.6208,
      courts_count: 12,
      surface_type: 'HARD',
      indoor: true,
      price_per_hour: 2500,
      facilities: ['Парковка', 'Раздевалки', 'Душевые', 'Прокат ракеток', 'Кафе'],
      rating: 4.9,
      phone: '+7 (495) 123-45-67',
      website: 'https://olimp-tennis.ru'
    },
    {
      name: 'ТЦ "Лужники"',
      address: 'Лужнецкая наб., 24, Москва',
      city: 'Москва',
      latitude: 55.7158,
      longitude: 37.5615,
      courts_count: 8,
      surface_type: 'CLAY',
      indoor: false,
      price_per_hour: 3000,
      facilities: ['Парковка', 'Раздевалки', 'Душевые', 'Магазин'],
      rating: 4.7,
      phone: '+7 (495) 234-56-78',
      website: 'https://luzhniki-tennis.ru'
    },
    {
      name: 'Теннисный клуб "Невский"',
      address: 'Невский пр., 100, Санкт-Петербург',
      city: 'Санкт-Петербург',
      latitude: 59.9311,
      longitude: 30.3609,
      courts_count: 6,
      surface_type: 'HARD',
      indoor: true,
      price_per_hour: 2200,
      facilities: ['Раздевалки', 'Душевые', 'Прокат ракеток'],
      rating: 4.6,
      phone: '+7 (812) 345-67-89',
      website: 'https://nevsky-tennis.ru'
    },
    {
      name: 'Спорткомплекс "Рубин"',
      address: 'ул. Баумана, 58, Казань',
      city: 'Казань',
      latitude: 55.7887,
      longitude: 49.1221,
      courts_count: 4,
      surface_type: 'HARD',
      indoor: true,
      price_per_hour: 1800,
      facilities: ['Парковка', 'Раздевалки'],
      rating: 4.4,
      phone: '+7 (843) 456-78-90'
    },
    {
      name: 'Открытые корты "Сокольники"',
      address: 'Сокольнический парк, Москва',
      city: 'Москва',
      latitude: 55.7903,
      longitude: 37.6739,
      courts_count: 10,
      surface_type: 'CLAY',
      indoor: false,
      price_per_hour: 1500,
      facilities: ['Парковка', 'Раздевалки'],
      rating: 4.2,
      phone: '+7 (495) 567-89-01'
    }
  ];

  const createdLocations = [];
  for (const locationData of locations) {
    const location = await prisma.location.create({
      data: locationData
    });
    createdLocations.push(location);
  }

  return createdLocations;
}

async function createGameRequests(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players];
  
  const gameTypes = ['SINGLES', 'DOUBLES'];
  const levels = ['BEGINNER', 'AMATEUR', 'INTERMEDIATE', 'ADVANCED'];
  const locations = [
    'Теннисный центр "Олимпийский"',
    'ТЦ "Лужники"', 
    'Теннисный клуб "Невский"',
    'Спорткомплекс "Рубин"',
    'Открытые корты "Сокольники"'
  ];

  for (let i = 0; i < 20; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const gameMode = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Создаем заявки на разные даты (от сегодня до +30 дней)
    const daysFromNow = Math.floor(Math.random() * 30);
    const hoursFromNow = 9 + Math.floor(Math.random() * 12); // 9:00 - 21:00
    const requestDate = new Date();
    requestDate.setDate(requestDate.getDate() + daysFromNow);
    requestDate.setHours(hoursFromNow, 0, 0, 0);

    await prisma.gameRequest.create({
      data: {
        creator_id: creator.id,
        type: 'GAME',
        title: `Игра ${gameMode.toLowerCase()} ${requestDate.toLocaleDateString('ru-RU')}`,
        description: `Ищу партнера для игры в теннис. Уровень: ${level.toLowerCase()}. Корт: ${location}`,
        game_mode: gameMode,
        date_time: requestDate,
        location: location,
        location_name: location,
        max_players: gameMode === 'SINGLES' ? 2 : 4,
        current_players: 1,
        payment_type: Math.random() > 0.7 ? 'PAID' : 'FREE',
        rating_type: 'NTRP',
        status: Math.random() > 0.8 ? 'COMPLETED' : 'ACTIVE',
        format_info: {
          level: level,
          preferred_age: `${20 + Math.floor(Math.random() * 30)}-${40 + Math.floor(Math.random() * 20)}`,
          court_type: Math.random() > 0.5 ? 'HARD' : 'CLAY'
        }
      }
    });
  }
}

async function createMatches(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players];
  
  const matchTypes = ['ONE_ON_ONE', 'DOUBLES'];
  const results = ['WIN', 'LOSS'];
  const scores = ['6-4 6-2', '6-3 6-4', '7-5 6-3', '6-4 3-6 6-2', '6-2 6-1', '7-6 6-4'];

  for (let i = 0; i < 50; i++) {
    const player1 = allUsers[Math.floor(Math.random() * allUsers.length)];
    let player2 = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    // Убеждаемся что игроки разные
    while (player2.id === player1.id) {
      player2 = allUsers[Math.floor(Math.random() * allUsers.length)];
    }

    const matchType = matchTypes[Math.floor(Math.random() * matchTypes.length)];
    const result = results[Math.floor(Math.random() * results.length)];
    const score = scores[Math.floor(Math.random() * scores.length)];
    
    // Матчи за последние 90 дней
    const daysAgo = Math.floor(Math.random() * 90);
    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() - daysAgo);

    await prisma.match.create({
      data: {
        player1_id: player1.id,
        player2_id: player2.id,
        type: matchType,
        result: result,
        score: score,
        match_date: matchDate,
        location: 'Теннисный корт',
        is_ranked: Math.random() > 0.3,
        duration_minutes: 60 + Math.floor(Math.random() * 120) // 60-180 минут
      }
    });
  }
}

async function createTournaments(users: any) {
  const { admin, organizer, testUser, players } = users;
  
  const tournaments = [
    {
      title: 'Кубок Москвы по теннису 2024',
      description: 'Престижный турнир для игроков всех уровней',
      type: 'SINGLE_ELIMINATION',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      registration_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      min_players: 8,
      max_players: 32,
      entry_fee: 2000,
      prize_pool: 50000,
      is_ranked: true,
      organizer_id: organizer.id,
      location: 'Теннисный центр "Олимпийский"',
      location_name: 'Олимпийский',
      requirements: {
        min_rating: 1000,
        max_rating: 2000,
        min_age: 18,
        max_age: 45
      }
    },
    {
      title: 'Открытое первенство Санкт-Петербурга',
      description: 'Турнир для продвинутых игроков',
      type: 'ROUND_ROBIN',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      registration_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      min_players: 6,
      max_players: 16,
      entry_fee: 3000,
      prize_pool: 80000,
      is_ranked: true,
      organizer_id: organizer.id,
      location: 'Теннисный клуб "Невский"',
      location_name: 'Невский',
      requirements: {
        min_rating: 1500,
        min_age: 21
      }
    },
    {
      title: 'Любительский турнир выходного дня',
      description: 'Дружеский турнир для начинающих игроков',
      type: 'SINGLE_ELIMINATION',
      start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      registration_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      min_players: 4,
      max_players: 16,
      entry_fee: 500,
      prize_pool: 5000,
      is_ranked: false,
      organizer_id: admin.id,
      location: 'Открытые корты "Сокольники"',
      location_name: 'Сокольники',
      requirements: {
        max_rating: 1200,
        min_age: 16
      }
    }
  ];

  const createdTournaments = [];
  for (const tournamentData of tournaments) {
    const tournament = await prisma.tournament.create({
      data: tournamentData
    });
    createdTournaments.push(tournament);

    // Регистрируем несколько игроков в каждый турнир
    const playersToRegister = players.slice(0, Math.min(8, players.length));
    for (const player of playersToRegister) {
      await prisma.tournamentRegistration.create({
        data: {
          tournament_id: tournament.id,
          player_id: player.id,
          registration_date: new Date(),
          status: 'CONFIRMED'
        }
      });
    }
  }

  return createdTournaments;
}

async function createTrainings(users: any) {
  const { admin, organizer, players } = users;
  
  const trainings = [
    {
      title: 'Тренировка техники подачи',
      description: 'Изучаем правильную технику подачи с профессиональным тренером',
      type: 'GROUP',
      date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // через 2 дня в 10:00
      duration_minutes: 90,
      max_participants: 8,
      current_participants: 0,
      coach_id: admin.id,
      price: 1500,
      location: 'Теннисный центр "Олимпийский"',
      location_name: 'Олимпийский',
      skill_level: 'BEGINNER',
      requirements: {
        min_age: 16,
        equipment_needed: ['Ракетка', 'Удобная обувь', 'Спортивная одежда']
      }
    },
    {
      title: 'Продвинутая тактика игры',
      description: 'Разбираем тактические схемы и стратегии игры',
      type: 'GROUP',
      date_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // через 5 дней в 14:00
      duration_minutes: 120,
      max_participants: 6,
      current_participants: 0,
      coach_id: organizer.id,
      price: 2500,
      location: 'ТЦ "Лужники"',
      location_name: 'Лужники',
      skill_level: 'ADVANCED',
      requirements: {
        min_age: 18,
        min_rating: 1400
      }
    },
    {
      title: 'Персональная тренировка',
      description: 'Индивидуальное занятие с профессиональным тренером',
      type: 'INDIVIDUAL',
      date_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // завтра в 16:00
      duration_minutes: 60,
      max_participants: 1,
      current_participants: 0,
      coach_id: admin.id,
      price: 4000,
      location: 'Теннисный центр "Олимпийский"',
      location_name: 'Олимпийский',
      skill_level: 'ANY'
    }
  ];

  for (const trainingData of trainings) {
    const training = await prisma.training.create({
      data: trainingData
    });

    // Регистрируем несколько игроков на групповые тренировки
    if (trainingData.type === 'GROUP') {
      const participantsCount = Math.min(3, players.length);
      for (let i = 0; i < participantsCount; i++) {
        await prisma.trainingRegistration.create({
          data: {
            training_id: training.id,
            participant_id: players[i].id,
            registration_date: new Date(),
            status: 'CONFIRMED'
          }
        });
      }

      // Обновляем количество участников
      await prisma.training.update({
        where: { id: training.id },
        data: { current_participants: participantsCount }
      });
    }
  }
}

async function createCases() {
  // Создаем кейсы
  const cases = [
    {
      name: 'Обычный кейс',
      description: 'Базовый кейс с простыми призами',
      price_balls: 100,
      rarity: 'COMMON',
      is_active: true,
      image_url: 'https://example.com/case1.jpg'
    },
    {
      name: 'Премиум кейс',
      description: 'Кейс с ценными призами и эксклюзивными предметами',
      price_balls: 250,
      rarity: 'RARE',
      is_active: true,
      image_url: 'https://example.com/case2.jpg'
    },
    {
      name: 'Легендарный кейс',
      description: 'Самый редкий кейс с уникальными призами',
      price_balls: 500,
      rarity: 'LEGENDARY',
      is_active: true,
      image_url: 'https://example.com/case3.jpg'
    },
    {
      name: 'Новогодний кейс',
      description: 'Праздничный кейс с тематическими призами',
      price_balls: 200,
      rarity: 'EPIC',
      is_active: false, // Сезонный кейс
      image_url: 'https://example.com/case4.jpg'
    }
  ];

  for (const caseData of cases) {
    const createdCase = await prisma.case.create({
      data: caseData
    });

    // Создаем призы для каждого кейса
    await createCaseItems(createdCase.id, caseData.rarity);
  }
}

async function createCaseItems(caseId: string, caseRarity: string) {
  const itemsByRarity = {
    'COMMON': [
      { name: '10 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'COMMON', probability: 40, value: 10 },
      { name: '25 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'COMMON', probability: 30, value: 25 },
      { name: 'Бейдж "Новичок"', description: 'Стартовый бейдж', type: 'VIRTUAL', rarity: 'COMMON', probability: 20, value: 0 },
      { name: 'Браслет теннисный', description: 'Простой спортивный браслет', type: 'PHYSICAL', rarity: 'COMMON', probability: 10, value: 300 }
    ],
    'RARE': [
      { name: '50 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'RARE', probability: 35, value: 50 },
      { name: '100 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'RARE', probability: 25, value: 100 },
      { name: 'Бейдж "Профи"', description: 'Профессиональный бейдж', type: 'VIRTUAL', rarity: 'RARE', probability: 20, value: 0 },
      { name: 'Теннисная кепка', description: 'Фирменная кепка', type: 'PHYSICAL', rarity: 'RARE', probability: 15, value: 800 },
      { name: 'Набор мячей Wilson', description: 'Профессиональные мячи (3 шт)', type: 'PHYSICAL', rarity: 'RARE', probability: 5, value: 1200 }
    ],
    'EPIC': [
      { name: '150 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'EPIC', probability: 30, value: 150 },
      { name: '250 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'EPIC', probability: 20, value: 250 },
      { name: 'Бейдж "Эксперт"', description: 'Экспертный бейдж', type: 'VIRTUAL', rarity: 'EPIC', probability: 15, value: 0 },
      { name: 'Теннисная футболка Nike', description: 'Профессиональная футболка', type: 'PHYSICAL', rarity: 'EPIC', probability: 20, value: 2500 },
      { name: 'Струны Luxilon', description: 'Профессиональные струны', type: 'PHYSICAL', rarity: 'EPIC', probability: 10, value: 1800 },
      { name: 'Сертификат на урок', description: 'Персональная тренировка с тренером', type: 'PHYSICAL', rarity: 'EPIC', probability: 5, value: 4000 }
    ],
    'LEGENDARY': [
      { name: '500 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'LEGENDARY', probability: 25, value: 500 },
      { name: '1000 мячей', description: 'Игровая валюта', type: 'VIRTUAL', rarity: 'LEGENDARY', probability: 15, value: 1000 },
      { name: 'Бейдж "Легенда"', description: 'Легендарный бейдж', type: 'VIRTUAL', rarity: 'LEGENDARY', probability: 10, value: 0 },
      { name: 'Ракетка Wilson Pro Staff', description: 'Профессиональная ракетка', type: 'PHYSICAL', rarity: 'LEGENDARY', probability: 25, value: 15000 },
      { name: 'Комплект экипировки Adidas', description: 'Полный комплект: футболка, шорты, кроссовки', type: 'PHYSICAL', rarity: 'LEGENDARY', probability: 15, value: 12000 },
      { name: 'VIP турнир пакет', description: 'Участие в VIP турнире + экипировка', type: 'PHYSICAL', rarity: 'LEGENDARY', probability: 10, value: 25000 }
    ]
  };

  const items = itemsByRarity[caseRarity] || itemsByRarity['COMMON'];

  for (const itemData of items) {
    await prisma.caseItem.create({
      data: {
        case_id: caseId,
        name: itemData.name,
        description: itemData.description,
        type: itemData.type,
        rarity: itemData.rarity,
        probability: itemData.probability,
        value: itemData.value,
        image_url: `https://example.com/items/${itemData.name.toLowerCase().replace(/\s/g, '_')}.jpg`,
        is_active: true
      }
    });
  }
}

async function createStories(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players.slice(0, 10)];

  const storyTypes = ['PHOTO', 'VIDEO'];
  const descriptions = [
    'Отличная тренировка сегодня! 🎾',
    'Победа в напряженном матче! 🏆',
    'Работаем над техникой подачи 💪',
    'Красивый удар с задней линии 🔥',
    'Тренировка в группе - всегда весело! 😊',
    'Новая ракетка в деле! 🎾',
    'Подготовка к турниру идет полным ходом 🏃‍♂️',
    'Идеальная погода для тенниса ☀️',
    'Работаем над тактикой игры 🧠',
    'После матча - заслуженный отдых 😌'
  ];

  for (let i = 0; i < 15; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const type = storyTypes[Math.floor(Math.random() * storyTypes.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    // Stories за последние 7 дней
    const hoursAgo = Math.floor(Math.random() * 168); // 7 дней * 24 часа
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    await prisma.story.create({
      data: {
        creator_id: creator.id,
        type: type,
        description: description,
        media_url: `https://example.com/stories/${type.toLowerCase()}/${i + 1}.${type === 'PHOTO' ? 'jpg' : 'mp4'}`,
        thumbnail_url: type === 'VIDEO' ? `https://example.com/stories/thumbnails/${i + 1}.jpg` : undefined,
        created_at: createdAt,
        expires_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000), // истекает через 24 часа
        is_active: hoursAgo < 24, // активна только если создана менее 24 часов назад
        likes_count: Math.floor(Math.random() * 20),
        views_count: Math.floor(Math.random() * 100) + 10
      }
    });
  }
}

async function createReferrals(users: any) {
  const { admin, organizer, testUser, players } = users;
  
  // Создаем реферальные связи
  // testUser пригласил нескольких игроков
  const referredByTestUser = players.slice(0, 3);
  for (const player of referredByTestUser) {
    await prisma.user.update({
      where: { id: player.id },
      data: { referred_by: testUser.id }
    });

    // Создаем активность
    await prisma.referralActivity.create({
      data: {
        referrer_id: testUser.id,
        referred_id: player.id,
        action: 'REGISTRATION',
        reward_balls: 50,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // за последние 30 дней
      }
    });
  }

  // organizer пригласил еще больше игроков
  const referredByOrganizer = players.slice(3, 8);
  for (const player of referredByOrganizer) {
    await prisma.user.update({
      where: { id: player.id },
      data: { referred_by: organizer.id }
    });

    await prisma.referralActivity.create({
      data: {
        referrer_id: organizer.id,
        referred_id: player.id,
        action: 'REGISTRATION',
        reward_balls: 50,
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // за последние 60 дней
      }
    });
  }

  // Создаем дополнительные активности (первые матчи рефералов)
  for (const player of referredByTestUser) {
    if (Math.random() > 0.5) {
      await prisma.referralActivity.create({
        data: {
          referrer_id: testUser.id,
          referred_id: player.id,
          action: 'FIRST_MATCH',
          reward_balls: 25,
          created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  // Обновляем балансы мячей у рефереров
  const testUserRewards = referredByTestUser.length * 50 + Math.floor(referredByTestUser.length * 0.5) * 25;
  await prisma.user.update({
    where: { id: testUser.id },
    data: { balls_balance: 300 + testUserRewards }
  });

  const organizerRewards = referredByOrganizer.length * 50 + Math.floor(referredByOrganizer.length * 0.5) * 25;
  await prisma.user.update({
    where: { id: organizer.id },
    data: { balls_balance: 500 + organizerRewards }
  });

  // Устанавливаем базовые балансы для других пользователей
  await prisma.user.update({
    where: { id: admin.id },
    data: { balls_balance: 1000 }
  });

  // Раздаем стартовые мячи всем игрокам
  for (const player of players) {
    await prisma.user.update({
      where: { id: player.id },
      data: { balls_balance: 50 + Math.floor(Math.random() * 200) }
    });
  }
}

main()
  .catch((e) => {
    logger.error('Ошибка выполнения сида:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });