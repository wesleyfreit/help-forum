import { DomainEvents } from '@/core/events/domain-events';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository';
import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository';
import { InMemoryQuestionAttachmentsRepository } from './in-memory-question-attachments-repository';
import { InMemoryStudentsRepository } from './in-memory-students-repository';

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: Question[] = [];

  constructor(
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository,
  ) {}

  async findById(questionId: string) {
    const question = this.items.find((question) => question.id.toString() === questionId);

    if (!question) {
      return null;
    }

    return question;
  }

  async create(question: Question) {
    this.items.push(question);

    await this.questionAttachmentsRepository.createMany(question.attachments.getItems());

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async save(question: Question) {
    const questionIndex = this.items.findIndex((item) => item.id === question.id);

    this.items[questionIndex] = question;

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems(),
    );

    await this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems(),
    );

    DomainEvents.dispatchEventsForAggregate(question.id);
  }

  async findBySlug(slug: string) {
    const question = this.items.find((question) => question.slug.value === slug);

    if (!question) {
      return null;
    }

    return question;
  }

  async findDetailsBySlug(slug: string) {
    const question = this.items.find((question) => question.slug.value === slug);

    if (!question) {
      return null;
    }

    const author = this.studentsRepository.items.find((student) =>
      student.id.equals(question.authorId),
    );

    if (!author) {
      throw new Error(`Author with "${question.authorId.toString()}" does not exist`);
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) => questionAttachment.questionId.equals(question.id),
    );

    const attachments = questionAttachments.map((questionAttachment) => {
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

    return QuestionDetails.create({
      questionId: question.id,
      title: question.title,
      slug: question.slug,
      content: question.content,
      bestAnswerId: question.bestAnswerId,
      author: {
        id: author.id,
        name: author.name,
      },
      attachments,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    });
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

    await this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    );
  }
}
