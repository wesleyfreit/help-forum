import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository';
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository';
import { Answer } from '@/domain/forum/enterprise/entities/answer';
import { AnswerWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/answer-with-author';
import { Injectable } from '@nestjs/common';
import { PrismaAnswerMapper } from '../mappers/prisma-answer-mapper';
import { PrismaAnswerWithAuthorMapper } from '../mappers/prisma-answer-with-author-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(
    private prisma: PrismaService,
    private answerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<Answer[]> {
    const answers = await this.prisma.answer.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return answers.map((answer) => PrismaAnswerMapper.toDomain(answer));
  }

  async findManyByQuestionIdWithAuthor(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<AnswerWithAuthor[]> {
    const answers = await this.prisma.answer.findMany({
      where: {
        questionId,
      },
      include: {
        attachments: true,
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return answers.map((answer) => PrismaAnswerWithAuthorMapper.toDomain(answer));
  }

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await this.prisma.answer.create({ data });

    await this.answerAttachmentsRepository.createMany(answer.attachments.getItems());
  }

  async save(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await Promise.all([
      this.prisma.answer.update({
        where: {
          id: data.id,
        },
        data,
      }),
      this.answerAttachmentsRepository.createMany(answer.attachments.getNewItems()),
      this.answerAttachmentsRepository.deleteMany(answer.attachments.getRemovedItems()),
    ]);
  }

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      return null;
    }

    return PrismaAnswerMapper.toDomain(answer);
  }

  async delete(answer: Answer): Promise<void> {
    await this.prisma.answer.delete({
      where: {
        id: answer.id.toString(),
      },
    });
  }
}
