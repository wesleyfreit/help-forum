import { PaginationParams } from '@/core/repositories/pagination-params';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionDetails } from '../../enterprise/entities/value-objects/question-details';

export abstract class QuestionsRepository {
  abstract findById(id: string): Promise<Question | null>;
  abstract findDetailsBySlug(id: string): Promise<QuestionDetails | null>;
  abstract create(question: Question): Promise<void>;
  abstract save(question: Question): Promise<void>;
  abstract findBySlug(slug: string): Promise<Question | null>;
  abstract findManyRecent(params: PaginationParams): Promise<Question[]>;
  abstract delete(question: Question): Promise<void>;
}
