import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { AnswerDetails } from '../../enterprise/entities/value-objects/answer-details';
import { AnswersRepository } from '../repositories/answers-repository';

interface FetchQuestionAnswersUseCaseRequest {
  page: number;
  questionId: string;
}

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    questionAnswers: AnswerDetails[];
  }
>;

@Injectable()
export class FetchQuestionAnswersUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const questionAnswers = await this.answersRepository.findManyByQuestionIdWithDetails(
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
