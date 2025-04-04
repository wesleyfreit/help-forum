import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { randomUUID } from 'node:crypto';
import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { AnswerComment } from '../../enterprise/entities/answer-comment';
import { DeleteAnswerCommentUseCase } from './delete-answer-comment';

let answerCommentsRepository: InMemoryAnswerCommentsRepository;
let sut: DeleteAnswerCommentUseCase;

let newAnswerComment: AnswerComment;

describe('Delete Answer Comment Use Case', () => {
  beforeEach(async () => {
    answerCommentsRepository = new InMemoryAnswerCommentsRepository();
    sut = new DeleteAnswerCommentUseCase(answerCommentsRepository);

    newAnswerComment = makeAnswerComment();

    await answerCommentsRepository.create(newAnswerComment);
  });

  it('should be able to delete a answer comment', async () => {
    await sut.execute({
      authorId: newAnswerComment.authorId.toString(),
      answerCommentId: newAnswerComment.id.toString(),
    });

    expect(answerCommentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a answer comment from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      answerCommentId: newAnswerComment.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
