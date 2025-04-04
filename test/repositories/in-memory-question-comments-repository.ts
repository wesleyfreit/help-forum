import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository';
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment';

export class InMemoryQuestionCommentsRepository implements QuestionCommentsRepository {
  public items: QuestionComment[] = [];

  async create(questioncomments: QuestionComment) {
    this.items.push(questioncomments);
  }

  async findById(questionCommentId: string) {
    const questionComment = this.items.find(
      (questionComment) => questionComment.id.toString() === questionCommentId,
    );

    if (!questionComment) {
      return null;
    }

    return questionComment;
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const questionComments = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20);

    return questionComments;
  }

  async delete(questionComment: QuestionComment) {
    const questionCommentIndex = this.items.findIndex(
      (item) => item.id === questionComment.id,
    );

    this.items.splice(questionCommentIndex, 1);
  }
}
