import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

export const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema);

const questionAlreadyExistsErrorSchema = z.object({
  message: z.string().default('Question already exists'),
  error: z.string().default('Conflict'),
  statusCode: z.number().default(409),
});

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('/questions')
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new question',
    operationId: 'createQuestion',
  })
  @ApiBody({ schema: zodToOpenAPI(createQuestionBodySchema) })
  @ApiCreatedResponse({ description: 'Question created' })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(httpValidationErrorSchema[401]),
  })
  @ApiConflictResponse({
    schema: zodToOpenAPI(questionAlreadyExistsErrorSchema),
  })
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body;
    const { sub: userId } = user;

    await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: [],
    });
  }
}
