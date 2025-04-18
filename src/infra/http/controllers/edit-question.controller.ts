import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Body, Controller, HttpCode, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const editQuestionParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(editQuestionParamSchema);

type QuestionIdRouterParam = z.infer<typeof editQuestionParamSchema>;

export const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type EditQuestionBody = z.infer<typeof editQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editQuestionBodySchema);

const questionAlreadyExistsErrorSchema = z.object({
  message: z.string().default('Question already exists'),
  error: z.string().default('Conflict'),
  statusCode: z.number().default(409),
});

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('/questions/:questionId')
export class EditQuestionController {
  constructor(private editQuestion: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Edit a question',
    operationId: 'editQuestion',
  })
  @ApiParam({
    schema: zodToOpenAPI(editQuestionParamSchema),
    name: 'questionId',
    required: true,
    type: 'string',
  })
  @ApiBody({ schema: zodToOpenAPI(editQuestionBodySchema) })
  @ApiNoContentResponse({ description: 'Question edited' })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(httpValidationErrorSchema[401]),
  })
  @ApiConflictResponse({
    schema: zodToOpenAPI(questionAlreadyExistsErrorSchema),
  })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdRouterParam,
    @Body(bodyValidationPipe) body: EditQuestionBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body;
    const { sub: userId } = user;

    await this.editQuestion.execute({
      questionId,
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
    });
  }
}
