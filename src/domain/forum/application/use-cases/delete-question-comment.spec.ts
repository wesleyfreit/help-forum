import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { randomUUID } from 'node:crypto';
import { makeQuestionComment } from 'test/factories/make-question-comment';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { QuestionComment } from '../../enterprise/entities/question-comment';
import { DeleteQuestionCommentUseCase } from './delete-question-comment';

let questionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: DeleteQuestionCommentUseCase;

let newQuestionComment: QuestionComment;

describe('Delete Question Comment Use Case', () => {
  beforeEach(async () => {
    questionCommentsRepository = new InMemoryQuestionCommentsRepository();
    sut = new DeleteQuestionCommentUseCase(questionCommentsRepository);

    newQuestionComment = makeQuestionComment();

    await questionCommentsRepository.create(newQuestionComment);
  });

  it('should be able to delete a question comment', async () => {
    await sut.execute({
      authorId: newQuestionComment.authorId.toString(),
      questionCommentId: newQuestionComment.id.toString(),
    });

    expect(questionCommentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a question comment from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      questionCommentId: newQuestionComment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
