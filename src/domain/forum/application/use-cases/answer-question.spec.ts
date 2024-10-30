import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { AnswerQuestionUseCase } from './answer-question';

let answersRepository: InMemoryAnswersRepository;
let sut: AnswerQuestionUseCase;

describe('Answer Question Use Case', () => {
  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository();
    sut = new AnswerQuestionUseCase(answersRepository);
  });

  it('should be able to create an answer', async () => {
    const { answer } = await sut.execute({
      instructorId: randomUUID(),
      questionId: randomUUID(),
      content: faker.lorem.text(),
    });

    expect(answer.id).toBeTruthy();
    expect(answersRepository.items[0].id).toEqual(answer.id);
  });
});
