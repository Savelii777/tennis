import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';  
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { createTestToken } from '../../app';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let userId: string;

  const loginAdmin = async () => {
    return createTestToken(1); 
  };

  const loginUser = async () => {
    userId = '2';
    return createTestToken(2);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
    
    adminToken = await loginAdmin();
    userToken = await loginUser();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User profile and stats', () => {
    it('/users (GET) - should return list of users with admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/users/:id (GET) - should return user details', async () => {
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      const testUserId = usersResponse.body[0].id;
      
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
    });

    it('/users/:id/profile (PATCH) - should update user profile', async () => {
      const updateProfileDto = {
        city: 'New City',
        bio: 'Updated bio',
        ntrpRating: 4.5
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateProfileDto)
        .expect(200);

      expect(response.body.profile.city).toEqual(updateProfileDto.city);
      expect(response.body.profile.bio).toEqual(updateProfileDto.bio);
    });

    it('/users/:id/statistics (GET) - should return user statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/statistics`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('matchesPlayed');
      expect(response.body).toHaveProperty('matchWins');
      expect(response.body).toHaveProperty('matchLosses');
      expect(response.body).toHaveProperty('tournamentsPlayed');
    });
  });

  describe('User tournaments', () => {
    it('/users/:id/tournaments (GET) - should return user tournaments', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/tournaments`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});