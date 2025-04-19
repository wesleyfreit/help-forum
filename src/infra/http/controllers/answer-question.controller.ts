import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const answerQuestionParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(answerQuestionParamSchema);

type QuestionIdRouterParam = z.infer<typeof answerQuestionParamSchema>;

export const answerQuestionBodySchema = z.object({
  content: z.string(),
});

export type AnswerQuestionBody = z.infer<typeof answerQuestionBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(answerQuestionBodySchema);

@ApiTags('Answers')
@ApiBearerAuth()
@Controller('/questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Answer a question',
    operationId: 'answerQuestion',
  })
  @ApiBody({ schema: zodToOpenAPI(answerQuestionBodySchema) })
  @ApiCreatedResponse({ description: 'Question answered' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  async handle(
    @Param('questionId', paramValidationPipe) questionId: QuestionIdRouterParam,
    @Body(bodyValidationPipe) body: AnswerQuestionBody,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body;
    const { sub: userId } = user;

    const result = await this.answerQuestion.execute({
      content,
      questionId,
      authorId: userId,
      attachmentsIds: [],
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
