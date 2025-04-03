import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';

export class InMemoryAnswersRepository implements AnswersRepository {
  public items: Answer[] = [];

  async findById(answerId: string) {
    const answer = this.items.find((answer) => answer.id.toString() === answerId);

    if (!answer) {
      return null;
    }

    return answer;
  }

  async create(answer: Answer) {
    this.items.push(answer);
  }

  async save(answer: Answer) {
    const answerIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items[answerIndex] = answer;
  }

  async delete(answer: Answer) {
    const answerIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items.splice(answerIndex, 1);
  }
}
