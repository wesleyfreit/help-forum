import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { QuestionPresenter } from '../presenters/question-presenter';

const fetchRecentQuestionsQuerySchema = z.coerce
  .number()
  .optional()
  .default(1)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(fetchRecentQuestionsQuerySchema);

type PageQueryParam = z.infer<typeof fetchRecentQuestionsQuerySchema>;

const fetchRecentQuestionsResponseSchema = {
  200: z.object({
    questions: z.array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        sçug: z.string(),
        content: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
        authorId: z.string().uuid(),
      }),
    ),
  }),
  400: z.object({
    error: z.string().default('Bad Request'),
    statusCode: z.number().default(400),
  }),
  401: z.object({
    error: z.string().default('Unauthorized'),
    statusCode: z.number().default(401),
  }),
} as const;

@ApiTags('Questions')
@Controller('/questions')
@ApiBearerAuth()
export class FetchRecentQuestionsController {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Get()
  @ApiOkResponse({
    schema: zodToOpenAPI(fetchRecentQuestionsResponseSchema[200]),
  })
  @ApiOperation({
    summary: 'Fetch recent questions',
    operationId: 'fetchRecentQuestions',
  })
  @ApiQuery({
    schema: zodToOpenAPI(fetchRecentQuestionsQuerySchema),
    name: 'page',
    required: false,
    type: 'number',
  })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(fetchRecentQuestionsResponseSchema[401]),
  })
  @ApiBadRequestResponse({
    schema: zodToOpenAPI(fetchRecentQuestionsResponseSchema[400]),
  })
  async handle(@Query('page', queryValidationPipe) page: PageQueryParam) {
    const result = await this.fetchRecentQuestions.execute({
      page,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      questions: result.value.recentQuestions.map((question) =>
        QuestionPresenter.toHTTP(question),
      ),
    };
  }
}
