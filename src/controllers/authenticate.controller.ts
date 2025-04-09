import { PrismaService } from '@/prisma/prisma.service';
import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { compare } from 'bcryptjs';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

export const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthenticateBody = z.infer<typeof authenticateBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema);

const authenticateResponseSchema = {
  200: z.object({
    user: z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      access_token: z.string().jwt(),
    }),
  }),
  401: z.object({
    message: z.string().default('User credentials do not match'),
    error: z.string().default('Unauthorized'),
    statusCode: z.number().default(401),
  }),
} as const;

@ApiTags('Users')
@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate a user',
    operationId: 'authenticate',
  })
  @ApiBody({ schema: zodToOpenAPI(authenticateBodySchema) })
  @ApiUnauthorizedResponse({
    schema: zodToOpenAPI(authenticateResponseSchema[401]),
  })
  @ApiOkResponse({
    schema: zodToOpenAPI(authenticateResponseSchema[200]),
  })
  async handle(@Body(bodyValidationPipe) body: AuthenticateBody) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User credentials do not match');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('User credentials do not match');
    }

    const accessToken = this.jwt.sign({}, { subject: user.id, expiresIn: '1h' });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        access_token: accessToken,
      },
    };
  }
}
