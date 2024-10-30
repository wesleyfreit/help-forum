import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { CreateQuestionUseCase } from './create-question';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';

let questionsRepository: InMemoryQuestionsRepository;
let sut: CreateQuestionUseCase;

describe('Create Question Use Case', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new CreateQuestionUseCase(questionsRepository);
  });

  it('should be able to create a question', async () => {
    const { question } = await sut.execute({
      authorId: randomUUID(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
    });

    expect(question.id).toBeTruthy();
    expect(questionsRepository.items[0].id).toEqual(question.id);
  });
});
