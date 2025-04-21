import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { AnswerDetails } from '@/domain/forum/enterprise/entities/value-objects/answer-details';
import { InMemoryAnswerAttachmentsRepository } from './in-memory-answer-attachments-repository';
import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository';
import { InMemoryStudentsRepository } from './in-memory-students-repository';

export class InMemoryAnswersRepository implements AnswersRepository {
  public items: Answer[] = [];

  constructor(
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository,
  ) {}

  async findById(answerId: string) {
    const answer = this.items.find((answer) => answer.id.toString() === answerId);

    if (!answer) {
      return null;
    }

    return answer;
  }

  async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
    const questionAnswers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20);

    return questionAnswers;
  }

  async findManyByQuestionIdWithDetails(questionId: string, { page }: PaginationParams) {
    const questionAnswers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice((page - 1) * 20, page * 20)
      .map((answer) => {
        const author = this.studentsRepository.items.find((student) =>
          student.id.equals(answer.authorId),
        );

        if (!author) {
          throw new Error(`Author with "${answer.authorId.toString()}" does not exist`);
        }

        const answerAttachments = this.answerAttachmentsRepository.items.filter(
          (answerAttachment) => answerAttachment.answerId.equals(answer.id),
        );

        const attachments = answerAttachments.map((questionAttachment) => {
          const attachment = this.attachmentsRepository.items.find((attachment) =>
            attachment.id.equals(questionAttachment.attachmentId),
          );

          if (!attachment) {
            throw new Error(
              `Attachment with ID "${questionAttachment.attachmentId.toString()}" does not exist.`,
            );
          }

          return attachment;
        });

        return AnswerDetails.create({
          answerId: answer.id,
          content: answer.content,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
          attachments,
          author: {
            id: author.id,
            name: author.name,
          },
        });
      });

    return questionAnswers;
  }

  async create(answer: Answer) {
    this.items.push(answer);

    await this.answerAttachmentsRepository.createMany(answer.attachments.getItems());

    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async save(answer: Answer) {
    const answerIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items[answerIndex] = answer;

    await this.answerAttachmentsRepository.createMany(answer.attachments.getNewItems());

    await this.answerAttachmentsRepository.deleteMany(
      answer.attachments.getRemovedItems(),
    );

    DomainEvents.dispatchEventsForAggregate(answer.id);
  }

  async delete(answer: Answer) {
    const answerIndex = this.items.findIndex((item) => item.id === answer.id);

    this.items.splice(answerIndex, 1);

    await this.answerAttachmentsRepository.deleteManyByAnswerId(answer.id.toString());
  }
}
