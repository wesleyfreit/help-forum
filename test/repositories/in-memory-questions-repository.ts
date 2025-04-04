import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: Question[] = [];

  async findById(questionId: string) {
    const question = this.items.find((question) => question.id.toString() === questionId);

    if (!question) {
      return null;
    }

    return question;
  }

  async create(question: Question) {
    this.items.push(question);
  }

  async save(question: Question) {
    const questionIndex = this.items.findIndex((item) => item.id === question.id);

    this.items[questionIndex] = question;
  }

  async findBySlug(slug: string) {
    const question = this.items.find((question) => question.slug.value === slug);

    if (!question) {
      return null;
    }

    return question;
  }

  async findManyRecent({ page }: PaginationParams) {
    const recentQuestions = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return recentQuestions;
  }

  async delete(question: Question) {
    const questionIndex = this.items.findIndex((item) => item.id === question.id);

    this.items.splice(questionIndex, 1);
  }
}
