import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { AnswerQuestionUseCase } from './answer-question';

let answersRepository: InMemoryAnswersRepository;
let studentsRepository: InMemoryStudentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: AnswerQuestionUseCase;

describe('Answer Question Use Case', () => {
  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      attachmentsRepository,
      answerAttachmentsRepository,
      studentsRepository,
    );
    sut = new AnswerQuestionUseCase(answersRepository);
  });

  it('should be able to create an answer', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      questionId: randomUUID(),
      content: faker.lorem.text(),
      attachmentsIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(answersRepository.items[0]).toEqual(result.value?.answer);

    expect(answersRepository.items[0].attachments.currentItems).toHaveLength(2);
    expect(answersRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
    ]);
  });

  it('should persist attachments when answering a question', async () => {
    const result = await sut.execute({
      questionId: randomUUID(),
      authorId: randomUUID(),
      content: faker.lorem.text(),
      attachmentsIds: ['1', '2'],
    });

    expect(result.isRight()).toBe(true);
    expect(answerAttachmentsRepository.items).toHaveLength(2);
    expect(answerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ]),
    );
  });
});
