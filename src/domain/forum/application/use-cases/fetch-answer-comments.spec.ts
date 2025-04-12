import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments';

let answercommentsRepository: InMemoryAnswerCommentsRepository;
let sut: FetchAnswerCommentsUseCase;

describe('Fetch Answer Comments Use Case', () => {
  beforeEach(() => {
    answercommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new FetchAnswerCommentsUseCase(answercommentsRepository);
  });

  it('should be able to fetch answer comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    await answercommentsRepository.create(
      makeAnswerComment({ answerId: uniqueEntityID }),
    );
    await answercommentsRepository.create(
      makeAnswerComment({ answerId: uniqueEntityID }),
    );
    await answercommentsRepository.create(
      makeAnswerComment({ answerId: uniqueEntityID }),
    );

    const result = await sut.execute({
      page: 1,
      answerId: uniqueEntityID.toString(),
    });

    expect(result.value?.answerComments).toHaveLength(3);
  });

  it('should be able to fetch paginated answer comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await answercommentsRepository.create(
        makeAnswerComment({ answerId: uniqueEntityID }),
      );
    }

    const result = await sut.execute({
      page: 2,
      answerId: uniqueEntityID.toString(),
    });

    expect(result.value?.answerComments).toHaveLength(2);
  });
});
