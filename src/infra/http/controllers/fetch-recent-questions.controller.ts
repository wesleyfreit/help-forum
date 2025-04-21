import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
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

const fetchRecentQuestionsResponseSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      slug: z.string(),
      bestAnswerId: z.string().uuid().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
});

@ApiTags('Questions')
@Controller('/questions')
@ApiBearerAuth()
export class FetchRecentQuestionsController {
  constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch recent questions',
    operationId: 'fetchRecentQuestions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    schema: {
      type: 'number',
      default: 1,
      minimum: 1,
      nullable: true,
    },
  })
  @ApiOkResponse({
    schema: zodToOpenAPI(fetchRecentQuestionsResponseSchema),
  })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
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
