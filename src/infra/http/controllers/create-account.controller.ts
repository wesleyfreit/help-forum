import { PrismaService } from '@/infra/prisma/prisma.service';
import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { hash } from 'bcryptjs';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

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
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

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

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hash(password, 8);

    const account = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
      },
    };
  }
}
