import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student';
import { InvalidCredentialsError } from '@/domain/forum/application/use-cases/errors/invalid-credentials-error';
import { Public } from '@/infra/auth/public';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { StudentPresenter } from '../presenters/student-presenter';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthenticateBody = z.infer<typeof authenticateBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema);

const authenticateResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    access_token: z.string().jwt(),
  }),
});

const invalidCredentialsErrorSchema = z.object({
  message: z.string().default('Credentials are not valid'),
  error: z.string().default('Unauthorized'),
  statusCode: z.number().default(401),
});

@ApiTags('Users')
@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateStudent: AuthenticateStudentUseCase) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate a user',
    operationId: 'authenticate',
  })
  @ApiBody({ schema: zodToOpenAPI(authenticateBodySchema) })
  @ApiOkResponse({ schema: zodToOpenAPI(authenticateResponseSchema) })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(invalidCredentialsErrorSchema) })
  async handle(@Body(bodyValidationPipe) body: AuthenticateBody) {
    const { email, password } = body;

    const result = await this.authenticateStudent.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    const { accessToken, student } = result.value;

    return {
      user: {
        ...StudentPresenter.toHTTP(student),
        access_token: accessToken,
      },
    };
  }
}
