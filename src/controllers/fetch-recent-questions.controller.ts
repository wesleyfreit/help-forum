import { JWTAuthGuard } from '@/auth/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

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
  401: z.object({
    error: z.string().default('Unauthorized'),
    statusCode: z.number().default(401),
  }),
} as const;

@ApiTags('Questions')
@Controller('/questions')
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

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
  async handle(@Query('page', queryValidationPipe) page: PageQueryParam) {
    const perPage = 10;

    const questions = await this.prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    return { questions };
  }
}
