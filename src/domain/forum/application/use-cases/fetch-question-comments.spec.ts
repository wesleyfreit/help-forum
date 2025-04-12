import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { FetchQuestionCommentsUseCase } from './fetch-question-comments';

let questioncommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe('Fetch Question Comments Use Case', () => {
  beforeEach(() => {
    questioncommentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new FetchQuestionCommentsUseCase(questioncommentsRepository);
  });

  it('should be able to fetch question comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    await questioncommentsRepository.create(
      makeQuestionComment({ questionId: uniqueEntityID }),
    );
    await questioncommentsRepository.create(
      makeQuestionComment({ questionId: uniqueEntityID }),
    );
    await questioncommentsRepository.create(
      makeQuestionComment({ questionId: uniqueEntityID }),
    );

    const result = await sut.execute({
      page: 1,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionComments).toHaveLength(3);
  });

  it('should be able to fetch paginated question comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await questioncommentsRepository.create(
        makeQuestionComment({ questionId: uniqueEntityID }),
      );
    }

    const result = await sut.execute({
      page: 2,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionComments).toHaveLength(2);
  });
});
