import { Either, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { Answer } from '../../enterprise/entities/answer';
import { AnswersRepository } from '../repositories/answers-repository';

interface FetchQuestionAnswersUseCaseRequest {
  page: number;
  questionId: string;
}

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    questionAnswers: Answer[];
  }
>;

@Injectable()
export class FetchQuestionAnswersUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const questionAnswers = await this.answersRepository.findManyByQuestionId(
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
