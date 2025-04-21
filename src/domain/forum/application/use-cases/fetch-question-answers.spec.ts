import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeAnswer } from 'test/factories/make-answer';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';
import { makeAttachment } from 'test/factories/make-attachment';
import { makeStudent } from 'test/factories/make-student';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { Student } from '../../enterprise/entities/student';
import { FetchQuestionAnswersUseCase } from './fetch-question-answers';

let answersRepository: InMemoryAnswersRepository;
let studentsRepository: InMemoryStudentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: FetchQuestionAnswersUseCase;

let newStudent: Student;

describe('Fetch Question Answers Use Case', () => {
  beforeEach(async () => {
    studentsRepository = new InMemoryStudentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      attachmentsRepository,
      answerAttachmentsRepository,
      studentsRepository,
    );
    sut = new FetchQuestionAnswersUseCase(answersRepository);

    newStudent = makeStudent({
      name: 'John Doe',
    });

    await studentsRepository.create(newStudent);
  });

  it('should be able to fetch question answers', async () => {
    const uniqueEntityID = new UniqueEntityID();

    const answers = [
      makeAnswer({
        questionId: uniqueEntityID,
        authorId: newStudent.id,
      }),
      makeAnswer({ questionId: uniqueEntityID, authorId: newStudent.id }),
      makeAnswer({ questionId: uniqueEntityID, authorId: newStudent.id }),
    ];

    await answersRepository.create(answers[0]);
    await answersRepository.create(answers[1]);
    await answersRepository.create(answers[2]);

    const attachments = [
      makeAttachment({ title: 'Some attachment' }),
      makeAttachment({ title: 'Another attachment' }),
      makeAttachment({ title: 'Third attachment' }),
    ];

    attachmentsRepository.items.push(attachments[0]);
    attachmentsRepository.items.push(attachments[1]);
    attachmentsRepository.items.push(attachments[2]);

    answerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        attachmentId: attachments[0].id,
        answerId: answers[0].id,
      }),
      makeAnswerAttachment({
        attachmentId: attachments[1].id,
        answerId: answers[1].id,
      }),
      makeAnswerAttachment({
        attachmentId: attachments[2].id,
        answerId: answers[2].id,
      }),
    );

    const result = await sut.execute({
      page: 1,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionAnswers).toHaveLength(3);

    console.log(result.value?.questionAnswers[0].attachments);

    expect(result.value?.questionAnswers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          answerId: answers[0].id,
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: 'Some attachment',
            }),
          ]),
        }),
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          answerId: answers[1].id,
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: 'Another attachment',
            }),
          ]),
        }),
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          answerId: answers[2].id,
          attachments: expect.arrayContaining([
            expect.objectContaining({
              title: 'Third attachment',
            }),
          ]),
        }),
      ]),
    );
  });

  it('should be able to fetch paginated question answers', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await answersRepository.create(
        makeAnswer({ questionId: uniqueEntityID, authorId: newStudent.id }),
      );
    }

    const result = await sut.execute({
      page: 2,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.questionAnswers).toHaveLength(2);
  });
});
