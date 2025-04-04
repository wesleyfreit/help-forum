import { type Answer } from '@/domain/forum/enterprise/entities/answer';
import { randomUUID } from 'crypto';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { DeleteAnswerUseCase } from './delete-answer';
import { NotAllowedError } from './errors/not-allowed-error';

let answersRepository: InMemoryAnswersRepository;
let sut: DeleteAnswerUseCase;

let newAnswer: Answer;

describe('Delete Answer Use Case', () => {
  beforeEach(async () => {
    answersRepository = new InMemoryAnswersRepository();
    sut = new DeleteAnswerUseCase(answersRepository);

    newAnswer = makeAnswer();
    await answersRepository.create(newAnswer);
  });

  it('should be able to delete an answer', async () => {
    await sut.execute({
      authorId: newAnswer.authorId.toString(),
      answerId: newAnswer.id.toString(),
    });

    expect(answersRepository.items).toHaveLength(0);
  });

  it('should not be able to delete an answer from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      answerId: newAnswer.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
