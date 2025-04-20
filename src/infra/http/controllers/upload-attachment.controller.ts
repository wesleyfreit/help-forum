import { httpValidationErrorSchema } from '@/core/errors/validation/http-validation-error-schema';
import { InvalidAttachmentTypeError } from '@/domain/forum/application/use-cases/errors/invalid-attachment-type-error';
import { UploadAndCreateAttachmentUseCase } from '@/domain/forum/application/use-cases/upload-and-create-attachment';
import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { zodToOpenAPI } from 'nestjs-zod';

const parseFileValidationPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5mb
    new FileTypeValidator({ fileType: '.(png|jpg|jpeg|pdf)' }),
  ],
});

@ApiTags('Attachments')
@Controller('/attachments')
@ApiBearerAuth()
export class UploadAttachmentController {
  constructor(private uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload an attachment',
    operationId: 'uploadAttachment',
  })
  @ApiBadRequestResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[400]) })
  @ApiUnauthorizedResponse({ schema: zodToOpenAPI(httpValidationErrorSchema[401]) })
  async handle(@UploadedFile(parseFileValidationPipe) file: Express.Multer.File) {
    const result = await this.uploadAndCreateAttachment.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    const { attachment } = result.value;

    return {
      attachmentId: attachment.id.toString(),
    };
  }
}
