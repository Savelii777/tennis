import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('Matches E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/matches (POST) - should create a match', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({
        type: '1x1',
        creatorId: 1,
        player1Id: 2,
        player2Id: 3,
        state: 'draft',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.state).toBe('draft');
  });

  it('/matches (GET) - should return a list of matches', async () => {
    const response = await request(app.getHttpServer())
      .get('/matches')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/matches/:id (GET) - should return match details', async () => {
    const matchId = 1; 
    const response = await request(app.getHttpServer())
      .get(`/matches/${matchId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', matchId);
  });

  it('/matches/:id/respond (POST) - should respond to a match', async () => {
    const matchId = 1; 
    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/respond`)
      .send({ userId: 2 }) 
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Response recorded');
  });

  it('/matches/:id/accept (POST) - should accept participation', async () => {
    const matchId = 1; 
    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/accept`)
      .send({ userId: 2 }) 
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Participation accepted');
  });

  it('/matches/:id/cancel (DELETE) - should cancel a match', async () => {
    const matchId = 1; 
    const response = await request(app.getHttpServer())
      .delete(`/matches/${matchId}/cancel`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Match cancelled');
  });
});