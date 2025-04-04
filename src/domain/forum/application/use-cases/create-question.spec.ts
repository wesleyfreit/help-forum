import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { CreateQuestionUseCase } from './create-question';

let questionsRepository: InMemoryQuestionsRepository;
let sut: CreateQuestionUseCase;

describe('Create Question Use Case', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new CreateQuestionUseCase(questionsRepository);
  });

  it('should be able to create a question', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
    });

    expect(result.isRight()).toBe(true);
    expect(questionsRepository.items[0]).toEqual(result.value?.question);
  });
});
