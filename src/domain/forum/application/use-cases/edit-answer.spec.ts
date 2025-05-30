import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { type Answer } from '@/domain/forum/enterprise/entities/answer';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';
import { makeAnswer } from 'test/factories/make-answer';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { EditAnswerUseCase } from './edit-answer';

let answersRepository: InMemoryAnswersRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let studentsRepository: InMemoryStudentsRepository;
let sut: EditAnswerUseCase;

let newAnswer: Answer;

describe('Edit Answer Use Case', () => {
  beforeEach(async () => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      attachmentsRepository,
      answerAttachmentsRepository,
      studentsRepository,
    );
    sut = new EditAnswerUseCase(answersRepository, answerAttachmentsRepository);

    newAnswer = makeAnswer();
    await answersRepository.create(newAnswer);

    answerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        attachmentId: new UniqueEntityID('1'),
        answerId: newAnswer.id,
      }),
      makeAnswerAttachment({
        attachmentId: new UniqueEntityID('2'),
        answerId: newAnswer.id,
      }),
    );
  });

  it('should be able to edit an answer', async () => {
    const content = faker.lorem.text();

    await sut.execute({
      authorId: newAnswer.authorId.toString(),
      answerId: newAnswer.id.toString(),
      attachmentsIds: ['1', '3'],
      content,
    });

    expect(answersRepository.items[0]).toMatchObject({
      content,
    });

    expect(answersRepository.items[0].attachments.currentItems).toHaveLength(2);
    expect(answersRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
    ]);
  });

  it('should not be able to edit an answer from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      answerId: newAnswer.id.toString(),
      content: faker.lorem.text(),
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should sync new and removed attachments when editing an answer', async () => {
    const result = await sut.execute({
      authorId: newAnswer.authorId.toString(),
      answerId: newAnswer.id.toString(),
      attachmentsIds: ['1', '3'],
      content: faker.lorem.text(),
    });

    expect(result.isRight()).toBe(true);
    expect(answerAttachmentsRepository.items).toHaveLength(2);
    expect(answerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
      ]),
    );
  });
});
