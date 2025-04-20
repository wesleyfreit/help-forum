import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments';
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
import { CommentPresenter } from '../presenters/comment-presenter';

const fetchQuestionCommentsParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(fetchQuestionCommentsParamSchema);

type QuestionIdPathParam = z.infer<typeof fetchQuestionCommentsParamSchema>;

const fetchQuestionCommentsQuerySchema = z.coerce
  .number()
  .optional()
  .default(1)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(fetchQuestionCommentsQuerySchema);

type PageQueryParam = z.infer<typeof fetchQuestionCommentsQuerySchema>;

const fetchQuestionCommentsResponseSchema = z.object({
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

@ApiTags('Comments')
@Controller('/questions/:questionId/comments')
@ApiBearerAuth()
export class FetchQuestionCommentsController {
  constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch question comments',
    operationId: 'fetchQuestionComments',
  })
  @ApiParam({
    schema: zodToOpenAPI(fetchQuestionCommentsParamSchema),
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
    schema: zodToOpenAPI(fetchQuestionCommentsResponseSchema),
  })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdPathParam,
    @Query('page', queryValidationPipe) page: PageQueryParam,
  ) {
    const result = await this.fetchQuestionComments.execute({
      page,
      questionId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      comments: result.value.questionComments.map((answer) =>
        CommentPresenter.toHTTP(answer),
      ),
    };
  }
}
