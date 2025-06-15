import { PrismaClient, TournamentType, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedLocations } from './seeds/locations.seed';
import { seedCases } from './seeds/cases.seed'; // ← Добавить
import { seedReferrals } from './seeds/referrals.seed'; // ← Добавить

const prisma = new PrismaClient();

interface UsersResult {
  admin: User;
  organizer: User;
  players: User[];
}

interface TournamentsResult {
  singleEliminationTournament: any;
  groupsPlayoffTournament: any;
  leagueTournament: any;
  blitzTournament: any;
}

async function main() {
  console.log('Seeding database...');

  await seedLocations();
  await seedCases(); // ← Добавить
  console.log('Creating users...');
  const users = await createUsers();

  console.log('Creating tournaments...');
  const tournaments = await createTournaments(users.admin.id, users.organizer.id);

  console.log('Registering players to tournaments...');
  await registerPlayersToTournaments(tournaments, users);

  console.log('Creating tournament matches...');
  await createTournamentMatches(tournaments, users);
  await seedReferrals(); // ← Добавить

  console.log('Database seeded successfully');
}

async function createUsers(): Promise<UsersResult> {
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { telegramId: '123456789' },
    update: {},
    create: {
      telegramId: '123456789',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      profile: {
        create: {
          avatarUrl: 'https://avatars.example.com/admin.jpg',
          city: 'Moscow',
          ratingPoints: 1500,
          matchesPlayed: 50,
          matchWins: 35,
          matchLosses: 15,
          tournamentsPlayed: 10,
          tournamentsWon: 3
        }
      }
    }
  });

  const organizerHashedPassword = await bcrypt.hash('organizer123', 10);
  const organizer = await prisma.user.upsert({
    where: { telegramId: '234567890' },
    update: {},
    create: {
      telegramId: '234567890',
      username: 'organizer',
      firstName: 'Organizer',
      lastName: 'User',
      role: 'ORGANIZER',
      profile: {
        create: {
          avatarUrl: 'https://avatars.example.com/organizer.jpg',
          city: 'Saint Petersburg',
          ratingPoints: 1200,
          matchesPlayed: 30,
          matchWins: 18,
          matchLosses: 12,
          tournamentsPlayed: 5,
          tournamentsWon: 1
        }
      }
    }
  });

  const players = [];
  for (let i = 1; i <= 20; i++) {
    const playerHashedPassword = await bcrypt.hash(`player${i}`, 10);
    const player = await prisma.user.upsert({
      where: { telegramId: `player${i}` },
      update: {},
      create: {
        telegramId: `player${i}`,
        username: `player${i}`,
        firstName: `Player${i}`,
        lastName: `User${i}`,
        role: 'USER',
        profile: {
          create: {
            avatarUrl: `https://avatars.example.com/player${i}.jpg`,
            city: i % 2 === 0 ? 'Moscow' : 'Saint Petersburg',
            ratingPoints: 1000 + (i * 20),
            matchesPlayed: 10 + i,
            matchWins: 5 + Math.floor(i / 2),
            matchLosses: 5 + Math.floor(i / 3),
            tournamentsPlayed: Math.floor(i / 2),
            tournamentsWon: Math.floor(i / 5)
          }
        }
      }
    });
    players.push(player);
  }

  return { admin, organizer, players };
}

async function createTournaments(adminId: number, organizerId: number): Promise<TournamentsResult> {
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  const singleEliminationTournament = await prisma.tournament.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Summer Single Elimination Cup',
      description: 'Annual summer tournament with single elimination format',
      type: TournamentType.SINGLE_ELIMINATION,
      status: 'ACTIVE',
      creatorId: organizerId,
      startDate: now,
      endDate: oneWeekLater,
      formatDetails: {},
      minPlayers: 8,
      maxPlayers: 16,
      currentPlayers: 1,
      isRanked: true,
      locationName: 'Central Tennis Court'
    }
  });

  const groupsPlayoffTournament = await prisma.tournament.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Spring Groups Playoff',
      description: 'Spring tournament with group stage and playoff',
      type: TournamentType.GROUPS_PLAYOFF,
      status: 'DRAFT',
      creatorId: organizerId,
      startDate: oneWeekLater,
      endDate: twoWeeksLater,
      formatDetails: {},
      minPlayers: 12,
      maxPlayers: 24,
      currentPlayers: 1,
      isRanked: true,
      locationName: 'Tennis Park'
    }
  });

  const leagueTournament = await prisma.tournament.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'Winter Tennis League',
      description: 'Winter league competition',
      type: TournamentType.LEAGUE,
      status: 'COMPLETED',
      creatorId: adminId,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
      endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      formatDetails: {},
      minPlayers: 10,
      maxPlayers: 10,
      currentPlayers: 10,
      isRanked: true,
      locationName: 'Indoor Tennis Center'
    }
  });

  const blitzTournament = await prisma.tournament.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Weekend Blitz Tournament',
      description: 'Quick weekend tournament',
      type: TournamentType.SINGLE_ELIMINATION,
      status: 'DRAFT',
      creatorId: organizerId,
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      formatDetails: {},
      minPlayers: 8,
      maxPlayers: 8,
      currentPlayers: 1,
      isRanked: false,
      locationName: 'City Tennis Club'
    }
  });

  await prisma.$executeRaw`
    INSERT INTO "_TournamentToUser" ("A", "B") 
    VALUES (1, ${organizerId}), (2, ${organizerId}), (3, ${adminId}), (4, ${organizerId})
    ON CONFLICT DO NOTHING
  `;

  return { 
    singleEliminationTournament, 
    groupsPlayoffTournament, 
    leagueTournament, 
    blitzTournament 
  };
}

async function registerPlayersToTournaments(tournaments: TournamentsResult, users: UsersResult): Promise<void> {
  for (let i = 0; i < 8; i++) {
    const playerId = users.players[i].id;
    await prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournaments.singleEliminationTournament.id}, ${playerId})
      ON CONFLICT DO NOTHING
    `;
  }
  
  await prisma.tournament.update({
    where: { id: tournaments.singleEliminationTournament.id },
    data: { currentPlayers: 9 } 
  });

  for (let i = 0; i < 12; i++) {
    const playerId = users.players[i].id;
    await prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournaments.groupsPlayoffTournament.id}, ${playerId})
      ON CONFLICT DO NOTHING
    `;
  }
  
  await prisma.tournament.update({
    where: { id: tournaments.groupsPlayoffTournament.id },
    data: { currentPlayers: 13 } 
  });

  for (let i = 0; i < 9; i++) {
    const playerId = users.players[i].id;
    await prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournaments.leagueTournament.id}, ${playerId})
      ON CONFLICT DO NOTHING
    `;
  }
  
  await prisma.tournament.update({
    where: { id: tournaments.leagueTournament.id },
    data: { currentPlayers: 10 } 
  });

  for (let i = 10; i < 17; i++) {
    const playerId = users.players[i].id;
    await prisma.$executeRaw`
      INSERT INTO "_TournamentToUser" ("A", "B") 
      VALUES (${tournaments.blitzTournament.id}, ${playerId})
      ON CONFLICT DO NOTHING
    `;
  }
  
  await prisma.tournament.update({
    where: { id: tournaments.blitzTournament.id },
    data: { currentPlayers: 8 } 
  });
}

async function createTournamentMatches(tournaments: TournamentsResult, users: UsersResult): Promise<void> {

  for (let i = 0; i < 4; i++) {
    await prisma.$executeRaw`
      INSERT INTO "TournamentMatch" (
        "tournamentId", "round", "playerAId", "playerBId",
        "status", "scheduledAt", "confirmedBy", "createdAt", "updatedAt"
      )
      VALUES (
        ${tournaments.singleEliminationTournament.id}, 1, ${i * 2 + 3}, ${i * 2 + 4},
        'SCHEDULED', NOW(), ARRAY[]::integer[], NOW(), NOW()
      )
      ON CONFLICT DO NOTHING
    `;
  }

  await prisma.$executeRaw`
    UPDATE "TournamentMatch"
    SET 
      "score" = '6-4, 6-3',
      "winnerId" = 3,
      "status" = 'FINISHED',
      "confirmedBy" = ARRAY[3, 4]::integer[],
      "updatedAt" = NOW()
    WHERE "tournamentId" = ${tournaments.singleEliminationTournament.id} AND "round" = 1
    AND "playerAId" = 3 AND "playerBId" = 4
  `;

  await prisma.$executeRaw`
    UPDATE "TournamentMatch"
    SET 
      "score" = '7-5, 7-6',
      "winnerId" = 6,
      "status" = 'FINISHED',
      "confirmedBy" = ARRAY[5, 6]::integer[],
      "updatedAt" = NOW()
    WHERE "tournamentId" = ${tournaments.singleEliminationTournament.id} AND "round" = 1
    AND "playerAId" = 5 AND "playerBId" = 6
  `;

  await prisma.$executeRaw`
    INSERT INTO "TournamentMatch" (
      "tournamentId", "round", "playerAId", "playerBId",
      "status", "scheduledAt", "confirmedBy", "createdAt", "updatedAt"
    )
    VALUES (
      ${tournaments.singleEliminationTournament.id}, 2, 3, 6,
      'SCHEDULED', NOW(), ARRAY[]::integer[], NOW(), NOW()
    )
    ON CONFLICT DO NOTHING
  `;


  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      const playerAId = users.players[i].id;
      const playerBId = users.players[j].id;
      const winnerId = Math.random() > 0.5 ? playerAId : playerBId;
      const scoreA = Math.floor(Math.random() * 2) + 5; 
      const scoreB = Math.floor(Math.random() * 5);
      const score = winnerId === playerAId ? `${scoreA}-${scoreB}, 6-3` : `${scoreB}-${scoreA}, 3-6, 6-4`;

      await prisma.$executeRaw`
        INSERT INTO "TournamentMatch" (
          "tournamentId", "round", "playerAId", "playerBId",
          "status", "score", "winnerId", "scheduledAt", "confirmedBy", "createdAt", "updatedAt"
        )
        VALUES (
          ${tournaments.leagueTournament.id}, 1, ${playerAId}, ${playerBId},
          'FINISHED', ${score}, ${winnerId}, 
          ${new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)}, 
          ARRAY[${playerAId}, ${playerBId}]::integer[], NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });