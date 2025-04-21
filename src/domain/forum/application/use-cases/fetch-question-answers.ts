import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { AnswerWithAuthor } from '../../enterprise/entities/value-objects/answer-with-author';
import { AnswersRepository } from '../repositories/answers-repository';

interface FetchQuestionAnswersUseCaseRequest {
  page: number;
  questionId: string;
}

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    questionAnswers: AnswerWithAuthor[];
  }
>;

@Injectable()
export class FetchQuestionAnswersUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const questionAnswers = await this.answersRepository.findManyByQuestionIdWithAuthor(
      questionId,
      {
        page,
      },
    );

    return right({
      questionAnswers,
    });
  }
}
