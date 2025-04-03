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

  async findBySlug(slug: string) {
    const question = this.items.find((question) => question.slug.value === slug);

    if (!question) {
      return null;
    }

    return question;
  }

  async delete(question: Question) {
    const questionIndex = this.items.findIndex((item) => item.id === question.id);

    this.items.splice(questionIndex, 1);
  }
}
