import { type Answer } from '@/domain/forum/enterprise/entities/answer';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { EditAnswerUseCase } from './edit-answer';
import { NotAllowedError } from './errors/not-allowed-error';

let answersRepository: InMemoryAnswersRepository;
let sut: EditAnswerUseCase;

let newAnswer: Answer;

describe('Edit Answer Use Case', () => {
  beforeEach(async () => {
    answersRepository = new InMemoryAnswersRepository();
    sut = new EditAnswerUseCase(answersRepository);

    newAnswer = makeAnswer();
    await answersRepository.create(newAnswer);
  });

  it('should be able to edit an answer', async () => {
    const content = faker.lorem.text();

    await sut.execute({
      authorId: newAnswer.authorId.toString(),
      answerId: newAnswer.id.toString(),
      content,
    });

    expect(answersRepository.items[0]).toMatchObject({
      content,
    });
  });

  it('should not be able to edit an answer from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      answerId: newAnswer.id.toString(),
      content: faker.lorem.text(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
