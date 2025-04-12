import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { FetchQuestionAnswersUseCase } from './fetch-question-answers';

let answersRepository: InMemoryAnswersRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: FetchQuestionAnswersUseCase;

describe('Fetch Question Answers Use Case', () => {
  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(answerAttachmentsRepository);
    sut = new FetchQuestionAnswersUseCase(answersRepository);
  });

  it('should be able to fetch question answers', async () => {
    const uniqueEntityID = new UniqueEntityID();

    await answersRepository.create(makeAnswer({ questionId: uniqueEntityID }));
    await answersRepository.create(makeAnswer({ questionId: uniqueEntityID }));
    await answersRepository.create(makeAnswer({ questionId: uniqueEntityID }));

    const result = await sut.execute({
      page: 1,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionAnswers).toHaveLength(3);
  });

  it('should be able to fetch paginated question answers', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await answersRepository.create(makeAnswer({ questionId: uniqueEntityID }));
    }

    const result = await sut.execute({
      page: 2,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionAnswers).toHaveLength(2);
  });
});
