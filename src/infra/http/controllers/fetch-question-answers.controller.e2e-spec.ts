import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { AnswerAttachmentFactory } from 'test/factories/make-answer-attachment';
import { AttachmentFactory } from 'test/factories/make-attachment';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';

describe('Fetch question answers (E2E)', () => {
  let app: INestApplication<Server>;
  let jwt: JwtService;
  let answerFactory: AnswerFactory;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let answerAttachmentsFactory: AnswerAttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AnswerFactory,
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    answerFactory = app.get(AnswerFactory);
    studentFactory = app.get(StudentFactory);
    questionFactory = app.get(QuestionFactory);
    attachmentFactory = app.get(AttachmentFactory);
    answerAttachmentsFactory = app.get(AnswerAttachmentFactory);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /questions/:questionId/answers', { timeout: 10000 }, async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    });

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answers = await Promise.all([
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'new answer',
      }),
      answerFactory.makePrismaAnswer({
        authorId: user.id,
        questionId: question.id,
        content: 'another answer',
      }),
    ]);

    const attachments = await Promise.all([
      attachmentFactory.makePrismaAttachment({
        title: 'Some attachment',
      }),
      attachmentFactory.makePrismaAttachment({
        title: 'Another attachment',
      }),
    ]);

    await Promise.all([
      answerAttachmentsFactory.makePrismaAnswerAttachment({
        answerId: answers[0].id,
        attachmentId: attachments[0].id,
      }),
      answerAttachmentsFactory.makePrismaAnswerAttachment({
        answerId: answers[1].id,
        attachmentId: attachments[1].id,
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id.toString()}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        answers: expect.arrayContaining([
          expect.objectContaining({
            content: 'new answer',
            author: expect.objectContaining({ name: 'John Doe' }),
            attachments: expect.arrayContaining([
              expect.objectContaining({
                title: 'Some attachment',
              }),
            ]),
          }),
          expect.objectContaining({
            content: 'another answer',
            author: expect.objectContaining({ name: 'John Doe' }),
            attachments: expect.arrayContaining([
              expect.objectContaining({
                title: 'Another attachment',
              }),
            ]),
          }),
        ]),
      }),
    );
  });
});
