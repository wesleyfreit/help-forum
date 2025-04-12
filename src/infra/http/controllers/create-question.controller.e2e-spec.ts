import { AppModule } from '@/infra/app.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { Server } from 'node:net';
import request from 'supertest';

describe('Create question (E2E)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('123456', 8),
      },
    });

    const accessToken = jwt.sign({}, { subject: user.id });

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Question',
        content: 'question concent',
      });

    expect(response.statusCode).toBe(201);

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        slug: 'new-question',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });
});
