import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { 
  Role, 
  MediaType, 
  StoryStatus, 
  AuthSource, 
  CaseItemType, 
  BallTransactionType,
  MatchType,
  MatchState,
  TournamentType,
  TrainingState,
  TrainingType,
  PaymentType,
  CourtSurface
} from '@prisma/client';

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
    
    // Создаем заявки на игру
    logger.log('🎾 Создание заявок на игру...');
    await createGameRequests(users);
    
    // Создаем матчи
    logger.log('⚡ Создание матчей...');
    await createMatches(users);
    
    // Создаем турниры
    logger.log('🏆 Создание турниров...');
    await createTournaments(users);
    
    // Создаем тренировочные сессии
    logger.log('🏃‍♂️ Создание тренировок...');
    await createTrainingSessions(users);
    
    // Создаем кейсы и призы
    logger.log('🎁 Создание кейсов...');
    await createCases();
    
    // Создаем stories
    logger.log('📱 Создание stories...');
    await createStories(users);
    
    // Создаем рефералы
    logger.log('🔗 Создание рефералов...');
    await createReferrals(users);
    
    logger.log('🏆 Создание достижений...');
    await createAchievements(users);
    
    logger.log('📊 Создание рейтингов...');
    await createRatings(users);
    
    logger.log('✅ База данных успешно заполнена!');
    logger.log('');
    logger.log('📋 Тестовые аккаунты для входа через API:');
    logger.log('👑 Админ: telegram_id = "777888999", username = "admin"');
    logger.log('🏆 Организатор: telegram_id = "555666777", username = "organizer"');
    logger.log('👤 Пользователь: telegram_id = "123456789", username = "test_user"');
    logger.log('');
    logger.log('🔗 Полезные ссылки:');
    logger.log('📚 API Docs: http://localhost:13000/api');
    logger.log('🔧 Auth Helper: http://localhost:13000/api/auth-helper');
    
  } catch (error) {
    logger.error('❌ Ошибка заполнения базы данных:', error);
    throw error;
  }
}

async function cleanDatabase() {
  // Порядок важен из-за foreign key constraints
  // Сначала удаляем все зависимые таблицы
  await prisma.ratingHistory.deleteMany();
  await prisma.playerRating.deleteMany();
  await prisma.ratingSeason.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.referralActivity.deleteMany();
  await prisma.referralStats.deleteMany();
  await prisma.caseWinning.deleteMany();
  await prisma.caseOpening.deleteMany();
  await prisma.caseItem.deleteMany();
  await prisma.case.deleteMany();
  await prisma.story.deleteMany();
  await prisma.ballTransaction.deleteMany();
  await prisma.requestResponse.deleteMany();
  await prisma.gameRequest.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.training.deleteMany();
  await prisma.tournamentMatch.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.match.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userProfile.deleteMany();
  // Только теперь удаляем пользователей
  await prisma.user.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.sport.deleteMany();

  logger.log('✅ База данных очищена');
}

async function createUsers() {
  // Создаем страны
  const russia = await prisma.country.create({
    data: {
      name: 'Россия',
      code: 'RU',
      flagUrl: '🇷🇺'
    }
  });

  // Создаем города
  const moscow = await prisma.city.create({
    data: {
      name: 'Москва',
      countryCode: 'RU',
      population: 12500000,
      lat: 55.7558,
      lng: 37.6176,
      timezone: 'Europe/Moscow'
    }
  });

  const spb = await prisma.city.create({
    data: {
      name: 'Санкт-Петербург',
      countryCode: 'RU',
      population: 5400000,
      lat: 59.9311,
      lng: 30.3609,
      timezone: 'Europe/Moscow'
    }
  });

  // Создаем вид спорта
  const tennis = await prisma.sport.create({
    data: {
      title: 'Теннис',
      slug: 'tennis',
      emoji: '🎾'
    }
  });

  logger.log('Создание администратора...');
  const admin = await prisma.user.create({
    data: {
      telegramId: '777888999',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      countryCode: 'RU',
      cityId: moscow.id,
      sportId: tennis.id,
      referralCode: 'ADMIN001',
      ballsBalance: 1000,
      authSource: AuthSource.WEB,
      profile: {
        create: {
          avatarUrl: 'https://avatars.githubusercontent.com/u/admin',
          city: 'Москва',
          ratingPoints: 2000,
          matchesPlayed: 150,
          matchWins: 120,
          matchLosses: 30,
          tournamentsPlayed: 25,
          tournamentsWon: 20,
          dominantHand: 'RIGHT',
          preferredPlayTime: ['MORNING', 'DAY'],
          backhandType: 'TWO_HANDED',
          preferredSurface: 'HARD',
          playingStyle: 'AGGRESSIVE',
          favoriteShot: 'FOREHAND',
          selfAssessedLevel: 'TOURNAMENT',
          profileStepOneCompleted: true,
          profileStepTwoCompleted: true
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание организатора...');
  const organizer = await prisma.user.create({
    data: {
      telegramId: '555666777',
      username: 'organizer',
      firstName: 'Tournament',
      lastName: 'Organizer',
      role: Role.ORGANIZER,
      countryCode: 'RU',
      cityId: spb.id,
      sportId: tennis.id,
      referralCode: 'ORG001',
      ballsBalance: 500,
      authSource: AuthSource.TELEGRAM_BOT,
      profile: {
        create: {
          avatarUrl: 'https://avatars.githubusercontent.com/u/organizer',
          city: 'Санкт-Петербург',
          ratingPoints: 1850,
          matchesPlayed: 100,
          matchWins: 75,
          matchLosses: 25,
          tournamentsPlayed: 15,
          tournamentsWon: 8,
          dominantHand: 'RIGHT',
          preferredPlayTime: ['DAY', 'EVENING'],
          backhandType: 'ONE_HANDED',
          preferredSurface: 'CLAY',
          playingStyle: 'DEFENSIVE',
          favoriteShot: 'BACKHAND',
          selfAssessedLevel: 'CONFIDENT',
          profileStepOneCompleted: true,
          profileStepTwoCompleted: true
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание тестового пользователя...');
  const testUser = await prisma.user.create({
    data: {
      telegramId: '123456789',
      username: 'test_user',
      firstName: 'Test',
      lastName: 'User',
      role: Role.USER,
      countryCode: 'RU',
      cityId: moscow.id,
      sportId: tennis.id,
      referralCode: 'USER001',
      ballsBalance: 300,
      authSource: AuthSource.TELEGRAM_BOT,
      profile: {
        create: {
          avatarUrl: 'https://avatars.githubusercontent.com/u/testuser',
          city: 'Москва',
          ratingPoints: 1200,
          matchesPlayed: 45,
          matchWins: 28,
          matchLosses: 17,
          tournamentsPlayed: 5,
          tournamentsWon: 2,
          dominantHand: 'LEFT',
          preferredPlayTime: ['EVENING', 'NIGHT'],
          backhandType: 'TWO_HANDED',
          preferredSurface: 'HARD',
          playingStyle: 'UNIVERSAL',
          favoriteShot: 'SERVE',
          selfAssessedLevel: 'AMATEUR',
          profileStepOneCompleted: true,
          profileStepTwoCompleted: false
        }
      }
    },
    include: { profile: true }
  });

  logger.log('Создание обычных игроков...');
  const players = [];
  const cities = [moscow, spb];
  const firstNames = ['Алексей', 'Дмитрий', 'Андрей', 'Сергей', 'Максим', 'Иван', 'Артем', 'Никита', 'Роман', 'Владимир'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Волков', 'Смирнов', 'Попов', 'Лебедев', 'Новиков', 'Морозов'];
  const playingStyles = ['UNIVERSAL', 'DEFENSIVE', 'AGGRESSIVE', 'NET_PLAYER', 'BASIC'];
  const surfaces = ['HARD', 'CLAY', 'GRASS', 'CARPET'];
  const levels = ['BEGINNER', 'AMATEUR', 'CONFIDENT', 'TOURNAMENT', 'SEMI_PRO'];

  for (let i = 1; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const playingStyle = playingStyles[Math.floor(Math.random() * playingStyles.length)];
    const surface = surfaces[Math.floor(Math.random() * surfaces.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    const player = await prisma.user.create({
      data: {
        telegramId: `100000000${i.toString().padStart(2, '0')}`,
        username: `player${i}`,
        firstName: firstName,
        lastName: lastName,
        role: Role.USER,
        countryCode: 'RU',
        cityId: city.id,
        sportId: tennis.id,
        referralCode: `PLR${i.toString().padStart(3, '0')}`,
        ballsBalance: 50 + Math.floor(Math.random() * 200),
        authSource: AuthSource.TELEGRAM_BOT,
        profile: {
          create: {
            avatarUrl: `https://avatars.githubusercontent.com/u/player${i}`,
            city: city.name,
            ratingPoints: 800 + (i * 20) + Math.floor(Math.random() * 200),
            matchesPlayed: 10 + Math.floor(Math.random() * 40),
            matchWins: Math.floor((10 + Math.random() * 40) * 0.6),
            matchLosses: Math.floor((10 + Math.random() * 40) * 0.4),
            tournamentsPlayed: Math.floor(i / 5) + Math.floor(Math.random() * 3),
            tournamentsWon: Math.floor(i / 15) + (Math.random() > 0.7 ? 1 : 0),
            dominantHand: Math.random() > 0.8 ? 'LEFT' : 'RIGHT',
            preferredPlayTime: ['DAY', 'EVENING'],
            backhandType: Math.random() > 0.6 ? 'ONE_HANDED' : 'TWO_HANDED',
            preferredSurface: surface,
            playingStyle: playingStyle,
            favoriteShot: 'FOREHAND',
            selfAssessedLevel: level,
            profileStepOneCompleted: Math.random() > 0.3,
            profileStepTwoCompleted: Math.random() > 0.5
          }
        }
      },
      include: { profile: true }
    });
    players.push(player);
  }

  return { admin, organizer, testUser, players, cities: { moscow, spb }, tennis };
}


// Добавь функцию для создания тестовых достижений

async function createAchievements(users: any) {
  const { testUser, players } = users;
  const logger = new Logger('Seed:Achievements');
  
  logger.log('Создание достижений...');
  
  // Награждаем тестового пользователя несколькими достижениями
  const testUserAchievements = [
    'first_step',
    'first_match',
    'warmup',
    'first_success',
    'confidence_grows',
  ];

  for (const code of testUserAchievements) {
    await prisma.userAchievement.create({
      data: {
        userId: testUser.id,
        code: code,
        awardedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Случайные достижения для других игроков
  for (const player of players.slice(0, 10)) {
    const randomAchievements = ['first_step', 'first_match'];
    if (Math.random() > 0.5) randomAchievements.push('warmup');
    if (Math.random() > 0.7) randomAchievements.push('first_success');

    for (const code of randomAchievements) {
      await prisma.userAchievement.create({
        data: {
          userId: player.id,
          code: code,
          awardedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  logger.log('✅ Достижения созданы');
}


async function createGameRequests(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players];
  
  const gameTypes = ['SINGLES', 'DOUBLES'];
  const paymentTypes = ['FREE', 'HOST_PAYS', 'LOSER_PAYS', 'DIVIDED', 'FIXED_PRICE'];
  const locations = [
    'Теннисный центр "Олимпийский"',
    'ТЦ "Лужники"', 
    'Теннисный клуб "Невский"'
  ];

  for (let i = 0; i < 20; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const gameMode = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    const locationName = locations[Math.floor(Math.random() * locations.length)];
    
    // Создаем заявки на разные даты (от сегодня до +30 дней)
    const daysFromNow = Math.floor(Math.random() * 30);
    const hoursFromNow = 9 + Math.floor(Math.random() * 12); // 9:00 - 21:00
    const requestDate = new Date();
    requestDate.setDate(requestDate.getDate() + daysFromNow);
    requestDate.setHours(hoursFromNow, 0, 0, 0);

    await prisma.gameRequest.create({
      data: {
        creatorId: creator.id,
        type: 'SINGLE_GAME',
        title: `Игра ${gameMode.toLowerCase()} ${requestDate.toLocaleDateString('ru-RU')}`,
        description: `Ищу партнера для игры в теннис. Корт: ${locationName}`,
        gameMode: gameMode,
        dateTime: requestDate,
        locationName: locationName,
        maxPlayers: gameMode === 'SINGLES' ? 2 : 4,
        currentPlayers: 1,
        paymentType: paymentType,
        ratingType: 'RATED',
        status: Math.random() > 0.8 ? 'DONE' : 'OPEN',
        formatInfo: {
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
  
  const scores = ['6-4 6-2', '6-3 6-4', '7-5 6-3', '6-4 3-6 6-2', '6-2 6-1', '7-6 6-4'];

  for (let i = 0; i < 50; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const player1 = allUsers[Math.floor(Math.random() * allUsers.length)];
    let player2 = allUsers[Math.floor(Math.random() * allUsers.length)];
    
    // Убеждаемся что игроки разные
    while (player2.id === player1.id) {
      player2 = allUsers[Math.floor(Math.random() * allUsers.length)];
    }

    const score = scores[Math.floor(Math.random() * scores.length)];
    
    // Матчи за последние 90 дней
    const daysAgo = Math.floor(Math.random() * 90);
    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() - daysAgo);

    await prisma.match.create({
      data: {
        creatorId: creator.id,
        player1Id: player1.id,
        player2Id: player2.id,
        type: MatchType.ONE_ON_ONE,
        state: MatchState.FINISHED,
        score: score,
        createdAt: matchDate,
        updatedAt: matchDate
      }
    });
  }
}



// ...existing code...

async function createTournaments(users: any) {
  const { organizer, players } = users;
  
  logger.log('Создание турнира 1...');
  const tournament1 = await prisma.tournament.create({
    data: {
      title: 'Кубок Москвы по теннису 2024',
      description: 'Престижный турнир для игроков всех уровней',
      type: TournamentType.SINGLE_ELIMINATION,
      status: 'UPCOMING',
      creatorId: organizer.id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      formatDetails: {
        registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        entryFee: 2000,
        prizePool: 50000,
        requirements: {
          minRating: 1000,
          maxRating: 2000,
          minAge: 18,
          maxAge: 45
        }
      },
      minPlayers: 8,
      maxPlayers: 32,
      currentPlayers: 8,
      isRanked: true,
      locationName: 'Теннисный центр "Олимпийский"'
    }
  });

  // Добавляем участников к первому турниру
  const playersForTournament1 = players.slice(0, 8);
  await prisma.tournament.update({
    where: { id: tournament1.id },
    data: {
      players: {
        connect: playersForTournament1.map((player: any) => ({ id: player.id }))
      }
    }
  });

  logger.log('Создание турнира 2...');
  const tournament2 = await prisma.tournament.create({
    data: {
      title: 'Открытое первенство Санкт-Петербурга',
      description: 'Турнир для продвинутых игроков',
      type: TournamentType.GROUPS_PLAYOFF,
      status: 'UPCOMING',
      creatorId: organizer.id,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      formatDetails: {
        registrationEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        entryFee: 3000,
        prizePool: 80000,
        requirements: {
          minRating: 1500,
          minAge: 21
        },
        groups: 2,
        advancingPerGroup: 2
      },
      minPlayers: 6,
      maxPlayers: 16,
      currentPlayers: 6,
      isRanked: true,
      locationName: 'Теннисный клуб "Невский"'
    }
  });

  // Добавляем участников ко второму турниру
  const playersForTournament2 = players.slice(8, 14);
  await prisma.tournament.update({
    where: { id: tournament2.id },
    data: {
      players: {
        connect: playersForTournament2.map((player: any) => ({ id: player.id }))
      }
    }
  });

  logger.log('Создание турнира 3...');
  const tournament3 = await prisma.tournament.create({
    data: {
      title: 'Блиц-турнир выходного дня',
      description: 'Быстрый турнир для любителей активного отдыха',
      type: TournamentType.BLITZ,
      status: 'UPCOMING',
      creatorId: organizer.id,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 часов
      formatDetails: {
        registrationEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        entryFee: 500,
        prizePool: 8000,
        requirements: {
          minRating: 800,
          maxRating: 1800
        },
        matchFormat: 'short_sets', // короткие сеты
        timeLimit: 480, // 8 часов в минутах
        maxRounds: 3
      },
      minPlayers: 4,
      maxPlayers: 8,
      currentPlayers: 4,
      isRanked: false,
      locationName: 'Корты "Быстрая игра"'
    }
  });

  // Добавляем участников к третьему турниру
  const playersForTournament3 = players.slice(14, 18);
  await prisma.tournament.update({
    where: { id: tournament3.id },
    data: {
      players: {
        connect: playersForTournament3.map((player: any) => ({ id: player.id }))
      }
    }
  });

  logger.log('Создание турнира 4...');
  const tournament4 = await prisma.tournament.create({
    data: {
      title: 'Лига выходного дня',
      description: 'Круговой турнир на протяжении месяца',
      type: TournamentType.LEAGUE,
      status: 'UPCOMING',
      creatorId: organizer.id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // месяц
      formatDetails: {
        registrationEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        entryFee: 1000,
        prizePool: 12000,
        requirements: {
          minRating: 1200,
          maxRating: 2000
        },
        matchesPerWeek: 2,
        pointsForWin: 3,
        pointsForDraw: 1,
        leagueTable: []
      },
      minPlayers: 6,
      maxPlayers: 12,
      currentPlayers: 6,
      isRanked: true,
      locationName: 'Теннисные корты "Лига"'
    }
  });

  // Добавляем участников к четвертому турниру
  const playersForTournament4 = players.slice(18, 24);
  await prisma.tournament.update({
    where: { id: tournament4.id },
    data: {
      players: {
        connect: playersForTournament4.map((player: any) => ({ id: player.id }))
      }
    }
  });

  const createdTournaments = [tournament1, tournament2, tournament3, tournament4];
  
  logger.log(`✅ Создано ${createdTournaments.length} турниров`);
  return createdTournaments;
}




async function createTrainingSessions(users: any) {
  const { admin, organizer, players } = users;
  
  const trainings = [
    {
      title: 'Тренировка техники подачи',
      description: 'Изучаем правильную технику подачи с профессиональным тренером',
      creatorId: admin.id,
      locationName: 'Теннисный центр "Олимпийский"',
      courtSurface: CourtSurface.HARD,
      minLevel: 1.0,
      maxLevel: 3.0,
      maxSlots: 8,
      currentSlots: 3,
      paymentType: PaymentType.DIVIDED,
      pricePerPerson: 1500,
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // через 2 дня в 10:00
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11.5 * 60 * 60 * 1000), // 1.5 часа
      status: TrainingState.OPEN,
      trainingType: TrainingType.WITH_COACH
    },
    {
      title: 'Продвинутая тактика игры',
      description: 'Разбираем тактические схемы и стратегии игры',
      creatorId: organizer.id,
      locationName: 'ТЦ "Лужники"',
      courtSurface: CourtSurface.CLAY,
      minLevel: 3.0,
      maxLevel: 5.0,
      maxSlots: 6,
      currentSlots: 2,
      paymentType: PaymentType.FIXED_PRICE,
      pricePerPerson: 2500,
      dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // через 5 дней в 14:00
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 2 часа
      status: TrainingState.OPEN,
      trainingType: TrainingType.TECHNIQUE
    }
  ];

  for (const trainingData of trainings) {
    const training = await prisma.trainingSession.create({
      data: trainingData
    });

    // Добавляем участников через many-to-many связь
    const participantsToAdd = players.slice(0, trainingData.currentSlots);
    await prisma.trainingSession.update({
      where: { id: training.id },
      data: {
        participants: {
          connect: participantsToAdd.map((player: any) => ({ id: player.id }))
        }
      }
    });
  }
}

async function createCases() {
  const cases = [
    {
      name: 'Обычный кейс',
      description: 'Базовый кейс с простыми призами',
      priceBalls: 100,
      isActive: true,
      image: 'https://example.com/case1.jpg'
    },
    {
      name: 'Премиум кейс',
      description: 'Кейс с ценными призами и эксклюзивными предметами',
      priceBalls: 250,
      isActive: true,
      image: 'https://example.com/case2.jpg'
    },
    {
      name: 'Легендарный кейс',
      description: 'Самый редкий кейс с уникальными призами',
      priceBalls: 500,
      isActive: true,
      image: 'https://example.com/case3.jpg'
    }
  ];

  for (const caseData of cases) {
    const createdCase = await prisma.case.create({
      data: caseData
    });

    // Создаем призы для каждого кейса
    await createCaseItems(createdCase.id);
  }
}

async function createCaseItems(caseId: number) {
  const items = [
    {
      caseId: caseId,
      name: '50 мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 50 },
      dropChance: 0.4,
      imageUrl: 'https://example.com/balls.jpg',
      isActive: true
    },
    {
      caseId: caseId,
      name: 'Теннисная кепка',
      type: CaseItemType.PHYSICAL,
      payload: { item: 'cap', size: 'universal' },
      dropChance: 0.3,
      imageUrl: 'https://example.com/cap.jpg',
      isActive: true
    },
    {
      caseId: caseId,
      name: '100 мячей',
      type: CaseItemType.VIRTUAL,
      payload: { balls: 100 },
      dropChance: 0.2,
      imageUrl: 'https://example.com/balls2.jpg',
      isActive: true
    },
    {
      caseId: caseId,
      name: 'Ракетка Wilson',
      type: CaseItemType.PHYSICAL,
      payload: { item: 'racket', brand: 'Wilson', model: 'Pro Staff' },
      dropChance: 0.1,
      imageUrl: 'https://example.com/racket.jpg',
      isActive: true
    }
  ];

  for (const itemData of items) {
    await prisma.caseItem.create({
      data: itemData
    });
  }
}

async function createStories(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players.slice(0, 10)];

  for (let i = 0; i < 15; i++) {
    const creator = allUsers[Math.floor(Math.random() * allUsers.length)];
    const type = Math.random() > 0.7 ? MediaType.video : MediaType.image;
    
    // Stories за последние 7 дней
    const hoursAgo = Math.floor(Math.random() * 168); // 7 дней * 24 часа
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    await prisma.story.create({
      data: {
        userId: creator.id,
        telegramFileId: `file_${i}_${Date.now()}`,
        telegramFilePath: `stories/${type}/${i + 1}.${type === MediaType.image ? 'jpg' : 'mp4'}`,
        type: type,
        status: hoursAgo < 24 ? StoryStatus.approved : StoryStatus.pending,
        createdAt: createdAt,
        publishedAt: hoursAgo < 24 ? createdAt : null
      }
    });
  }
}

async function createReferrals(users: any) {
  const { admin, organizer, testUser, players } = users;
  
  // testUser пригласил нескольких игроков
  const referredByTestUser = players.slice(0, 3);
  for (const player of referredByTestUser) {
    await prisma.user.update({
      where: { id: player.id },
      data: { referredBy: testUser.id }
    });

    // Создаем активность
    await prisma.referralActivity.create({
      data: {
        referrerId: testUser.id,
        invitedUserId: player.id,
        registeredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // за последние 30 дней
        isActive: Math.random() > 0.3,
        inviteSource: 'telegram'
      }
    });
  }

  // organizer пригласил еще больше игроков
  const referredByOrganizer = players.slice(3, 8);
  for (const player of referredByOrganizer) {
    await prisma.user.update({
      where: { id: player.id },
      data: { referredBy: organizer.id }
    });

    await prisma.referralActivity.create({
      data: {
        referrerId: organizer.id,
        invitedUserId: player.id,
        registeredAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // за последние 60 дней
        isActive: Math.random() > 0.3,
        inviteSource: 'telegram'
      }
    });
  }

  // Создаем статистику рефералов
  await prisma.referralStats.create({
    data: {
      userId: testUser.id,
      totalInvited: referredByTestUser.length,
      activeInvited: Math.floor(referredByTestUser.length * 0.7),
      registeredToday: 0,
      registeredThisWeek: 1,
      registeredThisMonth: referredByTestUser.length,
      achievementsEarned: ['FIRST_INVITE'],
      bonusPointsEarned: referredByTestUser.length * 50
    }
  });

  await prisma.referralStats.create({
    data: {
      userId: organizer.id,
      totalInvited: referredByOrganizer.length,
      activeInvited: Math.floor(referredByOrganizer.length * 0.8),
      registeredToday: 0,
      registeredThisWeek: 2,
      registeredThisMonth: referredByOrganizer.length,
      achievementsEarned: ['FIRST_INVITE', 'BUILDER'],
      bonusPointsEarned: referredByOrganizer.length * 50
    }
  });

  // Создаем транзакции мячей для всех пользователей
  const allUsers = [admin, organizer, testUser, ...players];
  for (const user of allUsers) {
    // Стартовые мячи
    await prisma.ballTransaction.create({
      data: {
        userId: user.id,
        amount: user.ballsBalance,
        type: BallTransactionType.BONUS,
        reason: 'Стартовые мячи при регистрации',
        balanceAfter: user.ballsBalance
      }
    });
  }
}

async function createRatings(users: any) {
  const { admin, organizer, testUser, players } = users;
  const allUsers = [admin, organizer, testUser, ...players];
  
  logger.log('Создание рейтингов игроков...');

  // Создаем текущий сезон
  const currentSeason = await prisma.ratingSeason.create({
    data: {
      title: 'Весна 2025',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
      description: 'Весенний сезон 2025 года'
    }
  });

  // Создаем рейтинги для всех пользователей
  for (const user of allUsers) {
    // Случайные значения в зависимости от профиля
    const skillPoints = user.profile?.ratingPoints || (1200 + Math.floor(Math.random() * 600));
    const skillRating = 2.0 + ((skillPoints - 800) / 200); // Примерное соответствие
    const pointsRating = 1000 + Math.floor(Math.random() * 500);
    const wins = user.profile?.matchWins || Math.floor(Math.random() * 20);
    const losses = user.profile?.matchLosses || Math.floor(Math.random() * 15);

    await prisma.playerRating.create({
      data: {
        userId: user.id,
        skillRating: Math.max(2.0, Math.min(7.0, Math.round(skillRating * 10) / 10)),
        skillPoints: Math.max(800, skillPoints),
        pointsRating,
        wins,
        losses,
      }
    });

    // Создаем начальную запись в истории
    await prisma.ratingHistory.create({
      data: {
        userId: user.id,
        seasonId: currentSeason.id,
        skillPointsBefore: 0,
        skillPointsAfter: skillPoints,
        pointsRatingBefore: 0,
        pointsRatingAfter: pointsRating,
        isWin: false,
        pointsEarned: pointsRating,
        reason: 'initial_rating'
      }
    });
  }

  logger.log(`✅ Создано рейтингов: ${allUsers.length}`);
  logger.log(`✅ Создан сезон: ${currentSeason.title}`);
}

main()
  .catch((e) => {
    logger.error('Ошибка выполнения сида:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });