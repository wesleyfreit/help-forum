import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification';
import { makeAnswer } from 'test/factories/make-answer';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { MockInstance } from 'vitest';
import { OnQuestionBestAnswerChosen } from './on-question-best-answer-chosen';

let questionsRepository: InMemoryQuestionsRepository;
let answersRepository: InMemoryAnswersRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let questionsAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let notificationsRepository: InMemoryNotificationsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let studentsRepository: InMemoryStudentsRepository;

let sut: SendNotificationUseCase;

let sendNotificationExecuteSpy: MockInstance;

describe('On Question Best Answer Chosen', () => {
  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();

    answersRepository = new InMemoryAnswersRepository(
      attachmentsRepository,
      answerAttachmentsRepository,
      studentsRepository,
    );
    questionsAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(questionsAttachmentsRepository);

    notificationsRepository = new InMemoryNotificationsRepository();

    sut = new SendNotificationUseCase(notificationsRepository);

    sendNotificationExecuteSpy = vi.spyOn(sut, 'execute');

    new OnQuestionBestAnswerChosen(answersRepository, sut);
  });

  it('should send a notification when a question has new best answer chosen', async () => {
    const question = makeQuestion();
    const answer = makeAnswer({
      questionId: question.id,
    });

    await questionsRepository.create(question);
    await answersRepository.create(answer);

    question.bestAnswerId = answer.id;

    await questionsRepository.save(question);

    expect(sendNotificationExecuteSpy).toHaveBeenCalled();
  });
});
