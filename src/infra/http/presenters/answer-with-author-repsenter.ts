import { AnswerWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/answer-with-author';
import { AttachmentPresenter } from './attachment-presenter';

export class AnswerWithAuthorPresenter {
  static toHTTP(answer: AnswerWithAuthor) {
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
