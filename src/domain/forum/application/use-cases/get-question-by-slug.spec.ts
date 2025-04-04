import { faker } from '@faker-js/faker';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let sut: GetQuestionBySlugUseCase;

describe('Get Question By Slug Use Case', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository);
    sut = new GetQuestionBySlugUseCase(questionsRepository);
  });

  it('should be able to get a question by slug', async () => {
    const slug = faker.lorem.slug();

    const newQuestion = makeQuestion({ slug: Slug.create(slug) });

    await questionsRepository.create(newQuestion);

    const result = await sut.execute({
      slug,
    });

    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: newQuestion.title,
      }),
    });
  });
});
