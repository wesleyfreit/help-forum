import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Edit question (E2E)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;
  let jwt: JwtService;
  let questionFactory: QuestionFactory;
  let studentFactory: StudentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    prisma = app.get(PrismaService);
    studentFactory = app.get(StudentFactory);
    questionFactory = app.get(QuestionFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PUT] /questions/:questionId', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Update Question',
        content: 'new question content',
      });

    expect(response.statusCode).toBe(204);

    const questionOnDatabase = await prisma.question.findUnique({
      where: {
        slug: 'update-question',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });
});
