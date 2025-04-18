import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Get question by slug (E2E)', () => {
  let app: INestApplication<Server>;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    studentFactory = app.get(StudentFactory);
    questionFactory = app.get(QuestionFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /questions/:slug', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.slug.value}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        question: expect.objectContaining({ slug: question.slug.value }),
      }),
    );
  });
});
