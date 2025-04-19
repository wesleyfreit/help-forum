import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const deleteQuestionParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(deleteQuestionParamSchema);

type QuestionIdRouterParam = z.infer<typeof deleteQuestionParamSchema>;

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('/questions/:questionId')
export class DeleteQuestionController {
  constructor(private deleteQuestion: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a question',
    operationId: 'deleteQuestion',
  })
  @ApiParam({
    schema: zodToOpenAPI(deleteQuestionParamSchema),
    name: 'questionId',
    required: true,
    type: 'string',
  })
  @ApiNoContentResponse({ description: 'Question deleted' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiForbiddenResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[403]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdRouterParam,
    @CurrentUser() user: UserPayload,
  ) {
    const { sub: userId } = user;

    const result = await this.deleteQuestion.execute({
      questionId,
      authorId: userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException();
      }
    }
  }
}
