import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Create question (E2E)', () => {
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

  test('[GET] /questions', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    await Promise.all([
      questionFactory.makePrismaQuestion({
        authorId: user.id,
        slug: Slug.create('new-question'),
      }),
      questionFactory.makePrismaQuestion({
        authorId: user.id,
        slug: Slug.create('another-question'),
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({ slug: 'new-question' }),
          expect.objectContaining({ slug: 'another-question' }),
        ]),
      }),
    );
  });
});
