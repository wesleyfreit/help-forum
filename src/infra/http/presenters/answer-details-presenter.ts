import { AnswerDetails } from '@/domain/forum/enterprise/entities/value-objects/answer-details';
import { AttachmentPresenter } from './attachment-presenter';

export class AnswerDetailsPresenter {
  static toHTTP(answer: AnswerDetails) {
    return {
      answerId: answer.answerId.toString(),
      content: answer.content,
      author: {
        id: answer.author.id.toString(),
        name: answer.author.name,
      },
      attachments: answer.attachments.map((attachment) =>
        AttachmentPresenter.toHTTP(attachment),
      ),
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }
}
