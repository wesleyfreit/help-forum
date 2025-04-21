import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { AttachmentPresenter } from './attachment-presenter';

export class QuestionDetailsPresenter {
  static toHTTP(question: QuestionDetails) {
    return {
      questionId: question.questionId.toString(),
      title: question.title,
      content: question.content,
      slug: question.slug.value,
      bestAnswerId: question.bestAnswerId?.toString(),
      author: {
        id: question.author.id.toString(),
        name: question.author.name,
      },
      attachments: question.attachments.map((attachment) =>
        AttachmentPresenter.toHTTP(attachment),
      ),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
