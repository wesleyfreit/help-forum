import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { Prisma, Answer as PrismaAnswer } from '@prisma/client';

export class PrismaAnswerMapper {
  static toDomain(raw: PrismaAnswer): Answer {
    return Answer.create(
      {
        questionId: new UniqueEntityID(raw.questionId),
        content: raw.content,
        authorId: new UniqueEntityID(raw.authorId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(answer: Answer): Prisma.AnswerUncheckedCreateInput {
    return {
      questionId: answer.questionId.toString(),
      id: answer.id.toString(),
      content: answer.content,
      authorId: answer.authorId.toString(),
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }
}
