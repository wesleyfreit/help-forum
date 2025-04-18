import { type Question } from '@/domain/forum/enterprise/entities/question';
import { randomUUID } from 'node:crypto';
import { makeAnswer } from 'test/factories/make-answer';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { Answer } from '../../enterprise/entities/answer';
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let answersRepository: InMemoryAnswersRepository;
let sut: ChooseQuestionBestAnswerUseCase;

let newQuestion: Question;
let newAnswer: Answer;

describe('Choose Question Best Answer Use Case', () => {
  beforeEach(async () => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository);
    answersRepository = new InMemoryAnswersRepository();
    sut = new ChooseQuestionBestAnswerUseCase(questionsRepository, answersRepository);

    newQuestion = makeQuestion();
    newAnswer = makeAnswer({
      questionId: newQuestion.id,
    });

    await questionsRepository.create(newQuestion);
    await answersRepository.create(newAnswer);
  });

  it('should be able to choose the question best answer', async () => {
    await sut.execute({
      authorId: newQuestion.authorId.toString(),
      answerId: newAnswer.id.toString(),
    });

    expect(questionsRepository.items[0].bestAnswerId).toEqual(newAnswer.id);
  });

  it('should not be able to choose a question another user question best answer', async () => {
    await expect(
      sut.execute({
        authorId: randomUUID(),
        answerId: newQuestion.id.toString(),
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});
