import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { Server } from 'node:net';
import request from 'supertest';
import { StudentFactory } from 'test/factories/make-student';

describe('Authenticate (E2E)', () => {
  let app: INestApplication<Server>;
  let studentFactory: StudentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    studentFactory = app.get(StudentFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /sessions', async () => {
    await studentFactory.makePrismaStudent({
      password: await hash('123456', 6),
      email: 'john.doe@mail.com',
    });

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'john.doe@mail.com',
      password: '123456',
    });

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          access_token: expect.any(String),
        }),
      }),
    );
  });
});
