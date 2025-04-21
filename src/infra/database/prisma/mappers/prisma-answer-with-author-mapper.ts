import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AnswerDetails } from '@/domain/forum/enterprise/entities/value-objects/answer-details';
import {
  Answer as PrismaAnswer,
  Attachment as PrismaAttachment,
  User as PrismaUser,
} from '@prisma/client';
import { PrismaAttachmentMapper } from './prisma-attachment-mapper';

type PrismaAnswerWithAuthor = PrismaAnswer & {
  author: PrismaUser;
  attachments: PrismaAttachment[];
};

export class PrismaAnswerWithAuthorMapper {
  static toDomain(raw: PrismaAnswerWithAuthor): AnswerDetails {
    return AnswerDetails.create({
      answerId: new UniqueEntityID(raw.id),
      content: raw.content,
      author: {
        id: new UniqueEntityID(raw.author.id),
        name: raw.author.name,
      },
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      attachments: raw.attachments.map((attachment) =>
        PrismaAttachmentMapper.toDomain(attachment),
      ),
    });
  }
}
