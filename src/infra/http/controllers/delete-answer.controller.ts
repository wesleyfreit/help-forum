import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer';
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

const deleteAnswerParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(deleteAnswerParamSchema);

type AnswerIdRouterParam = z.infer<typeof deleteAnswerParamSchema>;

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('/answers/:answerId')
export class DeleteAnswerController {
  constructor(private deleteAnswer: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a answer',
    operationId: 'deleteAnswer',
  })
  @ApiParam({
    schema: zodToOpenAPI(deleteAnswerParamSchema),
    name: 'answerId',
    required: true,
    type: 'string',
  })
  @ApiNoContentResponse({ description: 'Answer deleted' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiForbiddenResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[403]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('answerId', paramValidationPipe) answerId: AnswerIdRouterParam,
    @CurrentUser() user: UserPayload,
  ) {
    const { sub: userId } = user;

    const result = await this.deleteAnswer.execute({
      answerId,
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
