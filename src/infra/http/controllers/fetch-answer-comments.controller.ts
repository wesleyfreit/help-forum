import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments';
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
import { CommentWithAuthorPresenter } from '../presenters/comment-with-author-presenter';

const fetchAnswerCommentsParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(fetchAnswerCommentsParamSchema);

type AnswerIdPathParam = z.infer<typeof fetchAnswerCommentsParamSchema>;

const fetchAnswerCommentsQuerySchema = z.coerce
  .number()
  .optional()
  .default(1)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(fetchAnswerCommentsQuerySchema);

type PageQueryParam = z.infer<typeof fetchAnswerCommentsQuerySchema>;

const fetchAnswerCommentsResponseSchema = z.object({
  answers: z.array(
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
@Controller('/answers/:answerId/comments')
@ApiBearerAuth()
export class FetchAnswerCommentsController {
  constructor(private fetchAnswerComments: FetchAnswerCommentsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch answer comments',
    operationId: 'fetchAnswerComments',
  })
  @ApiParam({
    schema: zodToOpenAPI(fetchAnswerCommentsParamSchema),
    name: 'answerId',
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
    schema: zodToOpenAPI(fetchAnswerCommentsResponseSchema),
  })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  async handle(
    @Param('answerId', paramValidationPipe) answerId: AnswerIdPathParam,
    @Query('page', queryValidationPipe) page: PageQueryParam,
  ) {
    const result = await this.fetchAnswerComments.execute({
      page,
      answerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      comments: result.value.comments.map((answer) =>
        CommentWithAuthorPresenter.toHTTP(answer),
      ),
    };
  }
}
