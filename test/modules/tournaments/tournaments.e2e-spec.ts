import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';  
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { TournamentType } from '@prisma/client';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let createdTournamentId: string;

  const login = async () => {
    try {
      console.log('Attempting login via Telegram...');
      const response = await request(app.getHttpServer())
        .post('/auth/login-telegram')
        .send({
          id: '234567890', 
          hash: 'valid_hash',
          username: 'organizer',
          first_name: 'Organizer',
          auth_date: Math.floor(Date.now() / 1000).toString(),
        });
      
      console.log('Login response status:', response.status);
      console.log('Login response body:', response.body);
      
      if (response.status !== 201 && response.status !== 200) {
        console.log('Attempting alternative login...');
        const altResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: 'organizer',
            password: 'password123',
          });
        
        console.log('Alt login response:', altResponse.status, altResponse.body);
        
        if (altResponse.body && altResponse.body.access_token) {
          return altResponse.body.access_token;
        }
      } else if (response.body && response.body.access_token) {
        return response.body.access_token;
      }
      
      throw new Error('Could not obtain authentication token');
    } catch (error) {
      console.error('Login error:', error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
    
    authToken = await login();
  });

  afterAll(async () => {
    if (createdTournamentId) {
      await prisma.tournament.delete({
        where: { id: parseInt(createdTournamentId) }
      }).catch(() => {});
    }
    await app.close();
  });

  describe('Tournament CRUD operations', () => {
    it('/tournaments (POST) - should create a tournament', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const createDto = {
        title: 'Test Tournament',
        description: 'Created during e2e test',
        type: 'SINGLE_ELIMINATION',
        startDate: tomorrow,
        endDate: nextWeek,
        minPlayers: 8,
        maxPlayers: 16,
        isRanked: true,
        locationName: 'Test Court'
      };

      const response = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual(createDto.title);
      expect(response.body.status).toEqual('DRAFT');

      createdTournamentId = response.body.id;
    });

    it('/tournaments (GET) - should return all tournaments', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/tournaments/:id (GET) - should return tournament details', async () => {
      const tournamentId = createdTournamentId || '1';
      
      const response = await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', parseInt(tournamentId));
    });

    it('/tournaments/:id (PATCH) - should update tournament', async () => {
      if (!createdTournamentId) {
        console.warn('Created tournament ID not available, skipping test');
        return;
      }

      const updateDto = {
        title: 'Updated Tournament Title',
        description: 'Updated description'
      };

      const response = await request(app.getHttpServer())
        .patch(`/tournaments/${createdTournamentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toEqual(updateDto.title);
      expect(response.body.description).toEqual(updateDto.description);
    });
  });

  describe('Tournament players management', () => {
    it('/tournaments/:id/players (POST) - should register a player to tournament', async () => {
      const tournamentId = createdTournamentId || '1';
      
      const playerResponse = await request(app.getHttpServer())
        .post('/auth/login-telegram')
        .send({
          id: 'player1',
          hash: 'valid_hash',
          username: 'player1',
          first_name: 'Player1',
          auth_date: Math.floor(Date.now() / 1000).toString(),
        });
      
      const playerToken = playerResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .post(`/tournaments/${tournamentId}/players`)
        .set('Authorization', `Bearer ${playerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id', parseInt(tournamentId));
      expect(response.body.currentPlayers).toBeGreaterThan(1);
    });

    it('/tournaments/:id/players (GET) - should list tournament players', async () => {
      const tournamentId = createdTournamentId || '1';
      
      const response = await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}/players`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Tournament workflow', () => {
    it('/tournaments/:id/start (POST) - should start a tournament', async () => {
      if (!createdTournamentId) {
        console.warn('Created tournament ID not available, skipping test');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/tournaments/${createdTournamentId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toEqual('ACTIVE');
    });

    it('/tournaments/:id/matches (GET) - should list tournament matches', async () => {
      const tournamentId = createdTournamentId || '1';
      
      const response = await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}/matches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});