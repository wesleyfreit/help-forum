import { StudentAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/student-already-exists-error';
import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { StudentPresenter } from '../presenters/student-presenter';
import { Public } from '@/infra/auth/public';

export const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateAccountBody = z.infer<typeof createAccountBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema);

const createAccountResponseSchema = {
  201: z.object({
    user: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
    }),
  }),
  409: z.object({
    message: z.string().default('User already exists'),
    error: z.string().default('Conflict'),
    statusCode: z.number().default(409),
  }),
} as const;

@ApiTags('Users')
@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(private registerStudent: RegisterStudentUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new account',
    operationId: 'createAccount',
  })
  @ApiBody({ schema: zodToOpenAPI(createAccountBodySchema) })
  @ApiConflictResponse({
    schema: zodToOpenAPI(createAccountResponseSchema[409]),
  })
  @ApiCreatedResponse({
    schema: zodToOpenAPI(createAccountResponseSchema[201]),
  })
  async handle(@Body(bodyValidationPipe) body: CreateAccountBody) {
    const { name, email, password } = body;

    const result = await this.registerStudent.execute({
      name,
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case StudentAlreadyExistsError:
          throw new ConflictException('User already exists');
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      user: { ...StudentPresenter.toHTTP(result.value.student) },
    };
  }
}
