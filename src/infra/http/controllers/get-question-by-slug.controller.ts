import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { QuestionPresenter } from '../presenters/question-presenter';

const getQuestionBySlugParamSchema = z.string().min(1);

const paramValidationPipe = new ZodValidationPipe(getQuestionBySlugParamSchema);

type SlugRouterParam = z.infer<typeof getQuestionBySlugParamSchema>;

const getQuestionBlySlugResponseSchema = {
  200: z.object({
    question: z.object({
      id: z.string().uuid(),
      title: z.string(),
      sçug: z.string(),
      content: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      authorId: z.string().uuid(),
    }),
  }),
} as const;

@ApiTags('Questions')
@Controller('/questions/:slug')
@ApiBearerAuth()
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Get()
  @ApiOkResponse({
    schema: zodToOpenAPI(getQuestionBlySlugResponseSchema[200]),
  })
  @ApiOperation({
    summary: 'Get question by slug',
    operationId: 'getQuestionBySlug',
  })
  @ApiParam({
    schema: zodToOpenAPI(getQuestionBySlugParamSchema),
    name: 'slug',
    required: true,
    type: 'string',
  })
  @ApiBadRequestResponse({
    schema: zodToOpenAPI(httpValidationErrorSchema[400]),
  })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(httpValidationErrorSchema[401]),
  })
  async handle(@Param('slug', paramValidationPipe) slug: SlugRouterParam) {
    console.log(slug);

    const result = await this.getQuestionBySlug.execute({ slug });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      question: QuestionPresenter.toHTTP(result.value.question),
    };
  }
}
