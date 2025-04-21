import { faker } from '@faker-js/faker';
import { makeAttachment } from 'test/factories/make-attachment';
import { makeQuestion } from 'test/factories/make-question';
import { makeQuestionAttachment } from 'test/factories/make-question-attachment';
import { makeStudent } from 'test/factories/make-student';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { Student } from '../../enterprise/entities/student';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let studentsRepository: InMemoryStudentsRepository;
let sut: GetQuestionBySlugUseCase;

let newStudent: Student;

describe('Get Question By Slug Use Case', () => {
  beforeEach(async () => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      attachmentsRepository,
      questionAttachmentsRepository,
      studentsRepository,
    );

    sut = new GetQuestionBySlugUseCase(questionsRepository);

    newStudent = makeStudent({
      name: 'John Doe',
    });

    await studentsRepository.create(newStudent);
  });

  it('should be able to get a question by slug', async () => {
    const slug = faker.lorem.slug();

    const newQuestion = makeQuestion({
      slug: Slug.create(slug),
      authorId: newStudent.id,
    });

    await questionsRepository.create(newQuestion);

    const attachment = makeAttachment({ title: 'Some attachment' });

    attachmentsRepository.items.push(attachment);

    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        attachmentId: attachment.id,
        questionId: newQuestion.id,
      }),
    );

    const result = await sut.execute({
      slug,
    });

    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: newQuestion.title,
        author: expect.objectContaining({
          name: 'John Doe',
        }),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            title: 'Some attachment',
          }),
        ]),
      }),
    });
  });
});
