import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { makeStudent } from 'test/factories/make-student';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { Student } from '../../enterprise/entities/student';
import { FetchQuestionCommentsUseCase } from './fetch-question-comments';

let studentsRepository: InMemoryStudentsRepository;
let questionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

let newStudent: Student;

describe('Fetch Question Comments Use Case', () => {
  beforeEach(async () => {
    studentsRepository = new InMemoryStudentsRepository();
    questionCommentsRepository = new InMemoryQuestionCommentsRepository(
      studentsRepository,
    );
    sut = new FetchQuestionCommentsUseCase(questionCommentsRepository);

    newStudent = makeStudent({
      name: 'John Doe',
    });

    await studentsRepository.create(newStudent);
  });

  it('should be able to fetch question comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    const comments = [
      makeQuestionComment({ questionId: uniqueEntityID, authorId: newStudent.id }),
      makeQuestionComment({ questionId: uniqueEntityID, authorId: newStudent.id }),
      makeQuestionComment({ questionId: uniqueEntityID, authorId: newStudent.id }),
    ];

    await questionCommentsRepository.create(comments[0]);
    await questionCommentsRepository.create(comments[1]);
    await questionCommentsRepository.create(comments[2]);

    const result = await sut.execute({
      page: 1,
      questionId: uniqueEntityID.toString(),
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

  it('should be able to fetch paginated question comments', async () => {
    const uniqueEntityID = new UniqueEntityID();

    for (let i = 1; i <= 22; i++) {
      await questionCommentsRepository.create(
        makeQuestionComment({ questionId: uniqueEntityID, authorId: newStudent.id }),
      );
    }

    const result = await sut.execute({
      page: 2,
      questionId: uniqueEntityID.toString(),
    });

    expect(result.value?.comments).toHaveLength(2);
  });
});
