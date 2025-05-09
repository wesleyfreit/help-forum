import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { AnswerCommentFactory } from 'test/factories/make-answer-comment';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Fetch question comments (E2E)', () => {
  let app: INestApplication<Server>;
  let jwt: JwtService;
  let answerFactory: AnswerFactory;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerCommentFactory: AnswerCommentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AnswerFactory, StudentFactory, QuestionFactory, AnswerCommentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    answerFactory = app.get(AnswerFactory);
    studentFactory = app.get(StudentFactory);
    questionFactory = app.get(QuestionFactory);
    answerCommentFactory = app.get(AnswerCommentFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /answers/:answerId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    });

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
      content: 'new answer',
    });

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: 'new answer comment',
      }),
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: 'another answer comment',
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id.toString()}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        comments: expect.arrayContaining([
          expect.objectContaining({
            content: 'new answer comment',
            author: expect.objectContaining({ name: 'John Doe' }),
          }),
          expect.objectContaining({
            content: 'another answer comment',
            author: expect.objectContaining({ name: 'John Doe' }),
          }),
        ]),
      }),
    );
  });
});
