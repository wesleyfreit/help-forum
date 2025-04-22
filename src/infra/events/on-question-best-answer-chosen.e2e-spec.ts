import { DomainEvents } from '@/core/events/domain-events';
import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Server } from 'node:net';
import request from 'supertest';
import { AnswerFactory } from 'test/factories/make-answer';
import { QuestionFactory } from 'test/factories/make-question';
import { StudentFactory } from 'test/factories/make-student';
import { waitFor } from 'test/utils/wait-on';

describe('On question best answer chosen (E2E)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;
  let jwt: JwtService;
  let questionFactory: QuestionFactory;
  let studentFactory: StudentFactory;
  let answerFactory: AnswerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = app.get(JwtService);
    prisma = app.get(PrismaService);
    studentFactory = app.get(StudentFactory);
    questionFactory = app.get(QuestionFactory);
    answerFactory = app.get(AnswerFactory);

    DomainEvents.shouldRun = true;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send a notification when question best answer is chosen', async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({}, { subject: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    });

    await request(app.getHttpServer())
      .patch(`/answers/${answer.id.toString()}/choose-as-best`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    await waitFor(async () => {
      const notificationOnDatabase = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      });

      expect(notificationOnDatabase).not.toBeNull();
    });
  });
});
