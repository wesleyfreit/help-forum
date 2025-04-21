import { PaginationParams } from '@/core/repositories/pagination-params';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { AnswerWithAuthor } from '../../enterprise/entities/value-objects/answer-with-author';

export abstract class AnswersRepository {
  abstract create(answer: Answer): Promise<void>;
  abstract save(answer: Answer): Promise<void>;
  abstract findById(id: string): Promise<Answer | null>;
  abstract delete(answer: Answer): Promise<void>;
  abstract findManyByQuestionId(
    questionId: string,
    params: PaginationParams,
  ): Promise<Answer[]>;
  abstract findManyByQuestionIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<AnswerWithAuthor[]>;
}
