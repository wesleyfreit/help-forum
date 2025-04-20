import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer';
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

const commentOnAnswerParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(commentOnAnswerParamSchema);

type AnswerIdRouterParam = z.infer<typeof commentOnAnswerParamSchema>;

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
});

type CommentOnAnswerBody = z.infer<typeof commentOnAnswerBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(commentOnAnswerBodySchema);

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('/answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(private commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Comment an answer',
    operationId: 'commentOnAnswer',
  })
  @ApiBody({ schema: zodToOpenAPI(commentOnAnswerBodySchema) })
  @ApiCreatedResponse({ description: 'Answer commented' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('answerId', paramValidationPipe) answerId: AnswerIdRouterParam,
    @Body(bodyValidationPipe) body: CommentOnAnswerBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body;
    const { sub: userId } = user;

    const result = await this.commentOnAnswer.execute({
      content,
      answerId,
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
