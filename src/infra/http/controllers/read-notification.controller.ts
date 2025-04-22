import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI, ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';

const readNotificationParamSchema = z.string().uuid();

const paramValidationPipe = new ZodValidationPipe(readNotificationParamSchema);

type NotificationIdRouterParam = z.infer<typeof readNotificationParamSchema>;

@ApiTags('Notifications')
@Controller('/notifications/:notificationId/read')
@ApiBearerAuth()
export class ReadNotificationController {
  constructor(private readNotification: ReadNotificationUseCase) {}

  @Patch()
  @HttpCode(204)
  @ApiOperation({
    summary: 'Read notification',
    operationId: 'readNotification',
  })
  @ApiParam({
    schema: zodToOpenAPI(readNotificationParamSchema),
    name: 'notificationId',
    required: true,
    type: 'string',
  })
  @ApiNoContentResponse({ description: 'Notification read successfully' })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  @ApiForbiddenResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[403]) })
  @ApiNotFoundResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[404]) })
  async handle(
    @Param('notificationId', paramValidationPipe)
    notificationId: NotificationIdRouterParam,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.readNotification.execute({
      notificationId,
      recipientId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException();
      }
    }
  }
}
