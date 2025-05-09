import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const commentOnQuestionParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(commentOnQuestionParamSchema);

type QuestionIdRouterParam = z.infer<typeof commentOnQuestionParamSchema>;

const commentOnQuestionBodySchema = z.object({
  content: z.string(),
});

type CommentOnQuestionBody = z.infer<typeof commentOnQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(commentOnQuestionBodySchema);

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private commentOnQuestion: CommentOnQuestionUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Comment a question',
    operationId: 'commentOnQuestion',
  })
  @ApiBody({ schema: zodToOpenAPI(commentOnQuestionBodySchema) })
  @ApiCreatedResponse({ description: 'Question commented' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdRouterParam,
    @Body(bodyValidationPipe) body: CommentOnQuestionBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body;
    const { sub: userId } = user;

    const result = await this.commentOnQuestion.execute({
      content,
      questionId,
      authorId: userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException();
      }
    }
  }
}
