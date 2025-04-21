import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { QuestionDetailsPresenter } from '../presenters/question-details-presenter';

const getQuestionBySlugParamSchema = z.string().min(1);

const paramValidationPipe = new ZodValidationPipe(getQuestionBySlugParamSchema);

type SlugRouterParam = z.infer<typeof getQuestionBySlugParamSchema>;

const getQuestionBlySlugResponseSchema = z.object({
  question: z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    bestAnswerId: z.string().uuid().nullish(),
    content: z.string(),
    author: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
    attachments: z.array(
      z.object({
        id: z.string().uuid(),
        url: z.string().url(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

@ApiTags('Questions')
@Controller('/questions/:slug')
@ApiBearerAuth()
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlug: GetQuestionBySlugUseCase) {}

  @Get()
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
  @ApiOkResponse({ schema: zodToOpenAPI(getQuestionBlySlugResponseSchema) })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(@Param('slug', paramValidationPipe) slug: SlugRouterParam) {
    const result = await this.getQuestionBySlug.execute({ slug });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return {
      question: QuestionDetailsPresenter.toHTTP(result.value.question),
    };
  }
}
