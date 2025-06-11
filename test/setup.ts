import * as dotenv from 'dotenv';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { beforeAll, beforeEach } from '@jest/globals';

dotenv.config({ path: join(process.cwd(), '.env.test') });

beforeAll(async () => {
  console.log('Running test environment setup');
  console.log('Test environment variables:', {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET ? '[SECRET HIDDEN]' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });
});

const prisma = new PrismaClient();

beforeEach(async () => {
  try {
    const usersCount = await prisma.user.count();
    console.log(`Database has ${usersCount} users`);
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error connecting to test database:', e.message);
    } else {
      console.error('Error connecting to test database:', String(e));
    }
  }
});