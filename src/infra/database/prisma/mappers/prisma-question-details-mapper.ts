import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details';
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug';
import {
  Attachment as PrismaAttachment,
  Question as PrismaQuestion,
  User as PrismaUser,
} from '@prisma/client';
import { PrismaAttachmentMapper } from './prisma-attachment-mapper';

type PrismaQuestionDetails = PrismaQuestion & {
  author: PrismaUser;
  attachments: PrismaAttachment[];
};

export class PrismaQuestionDetailsMapper {
  static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
    return QuestionDetails.create({
      questionId: new UniqueEntityID(raw.id),
      content: raw.content,
      title: raw.title,
      slug: Slug.create(raw.slug),
      author: {
        id: new UniqueEntityID(raw.author.id),
        name: raw.author.name,
      },
      bestAnswerId: raw.bestAnswerId ? new UniqueEntityID(raw.bestAnswerId) : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      attachments: raw.attachments.map((attachment) =>
        PrismaAttachmentMapper.toDomain(attachment),
      ),
    });
  }
}
