import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { makeStudent } from 'test/factories/make-student';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { Student } from '../../enterprise/entities/student';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments';

let studentsRepository: InMemoryStudentsRepository;
let answerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: FetchAnswerCommentsUseCase;

let newStudent: Student;

describe('Fetch Answer Comments Use Case', () => {
  beforeEach(async () => {
    studentsRepository = new InMemoryStudentsRepository();
    answerCommentsRepository = new InMemoryAnswerCommentsRepository(studentsRepository);
    sut = new FetchAnswerCommentsUseCase(answerCommentsRepository);

    newStudent = makeStudent({
      name: 'John Doe',
    });

    await studentsRepository.create(newStudent);
  });

  it('should be able to fetch answer comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    const comments = [
      makeAnswerComment({ answerId: uniqueEntityID, authorId: newStudent.id }),
      makeAnswerComment({ answerId: uniqueEntityID, authorId: newStudent.id }),
      makeAnswerComment({ answerId: uniqueEntityID, authorId: newStudent.id }),
    ];

    await answerCommentsRepository.create(comments[0]);
    await answerCommentsRepository.create(comments[1]);
    await answerCommentsRepository.create(comments[2]);

    const result = await sut.execute({
      page: 1,
      answerId: uniqueEntityID.toString(),
    });

    expect(result.value?.comments).toHaveLength(3);

    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          commentId: comments[0].id,
        }),
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          commentId: comments[1].id,
        }),
        expect.objectContaining({
          author: expect.objectContaining({ name: 'John Doe' }),
          commentId: comments[2].id,
        }),
      ]),
    );
  });

  it('should be able to fetch paginated answer comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await answerCommentsRepository.create(
        makeAnswerComment({ answerId: uniqueEntityID, authorId: newStudent.id }),
      );
    }

    const result = await sut.execute({
      page: 2,
      answerId: uniqueEntityID.toString(),
    });

    expect(result.value?.comments).toHaveLength(2);
  });
});
