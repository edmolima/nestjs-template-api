import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Hello Endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /hello', () => {
    it('should return 200 with default "Hello World!" message', () => {
      return request(app.getHttpServer())
        .get('/hello')
        .expect(200)
        .expect((res) => {
          if (!res.body || typeof res.body.message !== 'string') {
            throw new Error('Invalid response: missing message field');
          }
          if (!res.body.message.includes('Hello')) {
            throw new Error('Invalid response: message should contain "Hello"');
          }
          if (res.body.message !== 'Hello World!') {
            throw new Error('Invalid response: expected default message');
          }
        });
    });

    it('should return 200 with personalized message when name is provided', () => {
      return request(app.getHttpServer())
        .get('/hello?name=Alice')
        .expect(200)
        .expect((res) => {
          if (!res.body || typeof res.body.message !== 'string') {
            throw new Error('Invalid response: missing message field');
          }
          if (res.body.message !== 'Hello Alice!') {
            throw new Error('Invalid response: expected personalized message');
          }
          if (res.body.name !== 'Alice') {
            throw new Error('Invalid response: expected name field');
          }
        });
    });

    it('should return 200 with id field in response', () => {
      return request(app.getHttpServer())
        .get('/hello')
        .expect(200)
        .expect((res) => {
          if (!res.body.id || typeof res.body.id !== 'number') {
            throw new Error('Invalid response: missing or invalid id field');
          }
        });
    });

    it('should persist data to database', async () => {
      const firstName = 'TestUser' + Date.now();

      const firstResponse = await request(app.getHttpServer())
        .get(`/hello?name=${firstName}`)
        .expect(200);

      expect(firstResponse.body).toHaveProperty('id');
      expect(firstResponse.body.message).toBe(`Hello ${firstName}!`);
    });
  });
});
