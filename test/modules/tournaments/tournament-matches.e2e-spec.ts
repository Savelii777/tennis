import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';  
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('Tournament Matches (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  const login = async (telegramId = '234567890') => {
    const response = await request(app.getHttpServer())
      .post('/auth/login-telegram')
      .send({
        id: telegramId,
        hash: 'valid_hash',
        username: telegramId === '234567890' ? 'organizer' : 'player1',
        first_name: telegramId === '234567890' ? 'Organizer' : 'Player1',
        auth_date: Math.floor(Date.now() / 1000).toString(),
      });
    
    return response.body.access_token;
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
    await app.close();
  });

  it('/tournaments/:id/matches/:matchId (GET) - should get match details', async () => {
    const tournamentId = '1';
    
    const matchesResponse = await request(app.getHttpServer())
      .get(`/tournaments/${tournamentId}/matches`)
      .expect(200);
    
    if (!matchesResponse.body.length) {
      console.warn('No matches found for testing');
      return;
    }
    
    const matchId = matchesResponse.body[0].id;
    
    const response = await request(app.getHttpServer())
      .get(`/tournaments/${tournamentId}/matches/${matchId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', matchId);
    expect(response.body).toHaveProperty('tournamentId', parseInt(tournamentId));
  });

  it('/tournaments/:id/matches/:matchId/result (POST) - should record match result', async () => {
    const tournamentId = '1';
    
    const matchesResponse = await request(app.getHttpServer())
      .get(`/tournaments/${tournamentId}/matches`)
      .expect(200);
    
    const unfinishedMatch = matchesResponse.body.find((m: any) => m.status !== 'FINISHED');
    
    if (!unfinishedMatch) {
      console.warn('No unfinished matches found for testing');
      return;
    }
    
    const playerToken = await login('player1');
    
    const recordResultDto = {
      score: '6-4, 7-5',
      winnerId: unfinishedMatch.playerAId
    };

    const response = await request(app.getHttpServer())
      .post(`/tournaments/${tournamentId}/matches/${unfinishedMatch.id}/result`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send(recordResultDto)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/tournaments/${tournamentId}/matches/${unfinishedMatch.id}/result`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(recordResultDto)
      .expect(200);
    
    const updatedMatchResponse = await request(app.getHttpServer())
      .get(`/tournaments/${tournamentId}/matches/${unfinishedMatch.id}`)
      .expect(200);
    
    expect(updatedMatchResponse.body.status).toEqual('FINISHED');
    expect(updatedMatchResponse.body.score).toEqual(recordResultDto.score);
    expect(updatedMatchResponse.body.winnerId).toEqual(recordResultDto.winnerId);
  });

  it('/tournaments/:id/standings (GET) - should get tournament standings', async () => {
    const tournamentId = '3'; 
    
    const response = await request(app.getHttpServer())
      .get(`/tournaments/${tournamentId}/standings`)
      .expect(200);

    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('players');
  });
});