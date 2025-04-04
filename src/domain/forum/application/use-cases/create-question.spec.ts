import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { CreateQuestionUseCase } from './create-question';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let sut: CreateQuestionUseCase;

describe('Create Question Use Case', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository);
    sut = new CreateQuestionUseCase(questionsRepository);
  });

  it('should be able to create a question', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
      attachmentsIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(questionsRepository.items[0]).toEqual(result.value?.question);

    expect(questionsRepository.items[0].attachments.currentItems).toHaveLength(2);
    expect(questionsRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
    ]);
  });
});
