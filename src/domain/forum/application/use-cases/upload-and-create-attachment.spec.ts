import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { FakeUploader } from 'test/storage/fake-uploader';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error';
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment';

let attachmentsRepository: InMemoryAttachmentsRepository;
let uploader: FakeUploader;
let sut: UploadAndCreateAttachmentUseCase;

describe('Upload and create attachment', () => {
  beforeEach(() => {
    attachmentsRepository = new InMemoryAttachmentsRepository();
    uploader = new FakeUploader();
    sut = new UploadAndCreateAttachmentUseCase(attachmentsRepository, uploader);
  });

  it('should be able to upload and create an attachment', async () => {
    const result = await sut.execute({
      fileName: 'sample-upload.png',
      fileType: 'image/png',
      body: Buffer.from('sample data'),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(
      expect.objectContaining({
        attachment: attachmentsRepository.items[0],
      }),
    );

    expect(uploader.uploads).toHaveLength(1);
    expect(uploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'sample-upload.png',
      }),
    );
  });

  it('should not be able to upload an attachment with invalid file type', async () => {
    const result = await sut.execute({
      fileName: 'sample-upload.mp3',
      fileType: 'audio/mpeg',
      body: Buffer.from('sample data'),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError);
  });
});
