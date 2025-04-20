import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
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

const chooseQuestionBestAnswerParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(chooseQuestionBestAnswerParamSchema);

type AnswerIdRouterParam = z.infer<typeof chooseQuestionBestAnswerParamSchema>;

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('/answers/:answerId/choose-as-best')
export class ChooseQuestionBestAnswerController {
  constructor(private chooseQuestionBestAnswer: ChooseQuestionBestAnswerUseCase) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Choose a question best answer',
    operationId: 'chooseQuestionBestAnswer',
  })
  @ApiParam({
    schema: zodToOpenAPI(chooseQuestionBestAnswerParamSchema),
    name: 'answerId',
    required: true,
    type: 'string',
  })
  @ApiNoContentResponse({ description: 'Best answer choosen' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiForbiddenResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[403]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('answerId', paramValidationPipe) answerId: AnswerIdRouterParam,
    @CurrentUser() user: UserPayload,
  ) {
    const { sub: userId } = user;

    const result = await this.chooseQuestionBestAnswer.execute({
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
