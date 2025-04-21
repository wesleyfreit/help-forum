import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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

const editAnswerParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(editAnswerParamSchema);

type AnswerIdRouterParam = z.infer<typeof editAnswerParamSchema>;

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()).default([]),
});

type EditAnswerBody = z.infer<typeof editAnswerBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema);

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('/answers/:answerId')
export class EditAnswerController {
  constructor(private editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit an answer',
    operationId: 'editAnswer',
  })
  @ApiParam({
    schema: zodToOpenAPI(editAnswerParamSchema),
    name: 'answerId',
    required: true,
    type: 'string',
  })
  @ApiBody({ schema: zodToOpenAPI(editAnswerBodySchema) })
  @ApiNoContentResponse({ description: 'Answer updated' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiForbiddenResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[403]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('answerId', paramValidationPipe) answerId: AnswerIdRouterParam,
    @Body(bodyValidationPipe) body: EditAnswerBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, attachments } = body;
    const { sub: userId } = user;

    const result = await this.editAnswer.execute({
      answerId,
      content,
      authorId: userId,
      attachmentsIds: attachments,
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
