import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers';
import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { AnswerWithAuthorPresenter } from '../presenters/answer-with-author-repsenter';

const fetchQuestionAnswersParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(fetchQuestionAnswersParamSchema);

type QuestionIdPathParam = z.infer<typeof fetchQuestionAnswersParamSchema>;

const fetchQuestionAnswersQuerySchema = z.coerce
  .number()
  .optional()
  .default(1)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(fetchQuestionAnswersQuerySchema);

type PageQueryParam = z.infer<typeof fetchQuestionAnswersQuerySchema>;

const fetchQuestionAnswersResponseSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      sçug: z.string(),
      content: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      authorId: z.string().uuid(),
    }),
  ),
});

@ApiTags('Answers')
@Controller('/questions/:questionId/answers')
@ApiBearerAuth()
export class FetchQuestionAnswersController {
  constructor(private fetchQuestionAnswers: FetchQuestionAnswersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch question answers',
    operationId: 'fetchQuestionAnswers',
  })
  @ApiParam({
    schema: zodToOpenAPI(fetchQuestionAnswersParamSchema),
    name: 'questionId',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    schema: {
      type: 'number',
      default: 1,
      minimum: 1,
      nullable: true,
    },
  })
  @ApiOkResponse({
    schema: zodToOpenAPI(fetchQuestionAnswersResponseSchema),
  })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdPathParam,
    @Query('page', queryValidationPipe) page: PageQueryParam,
  ) {
    const result = await this.fetchQuestionAnswers.execute({
      page,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      answers: result.value.questionAnswers.map((answer) =>
        AnswerWithAuthorPresenter.toHTTP(answer),
      ),
    };
  }
}
