import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { JWTAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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

const createQuestionResponseSchema = {
  401: z.object({
    error: z.string().default('Unauthorized'),
    statusCode: z.number().default(401),
  }),
  409: z.object({
    message: z.string().default('Question already exists'),
    error: z.string().default('Conflict'),
    statusCode: z.number().default(409),
  }),
} as const;

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('/questions')
@UseGuards(JWTAuthGuard)
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new Question',
    operationId: 'createQuestion',
  })
  @ApiBody({ schema: zodToOpenAPI(createQuestionBodySchema) })
  @ApiCreatedResponse({ description: 'Question created' })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(createQuestionResponseSchema[401]),
  })
  @ApiConflictResponse({
    schema: zodToOpenAPI(createQuestionResponseSchema[409]),
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
