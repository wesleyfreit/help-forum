import { faker } from '@faker-js/faker';
import { makeQuestion } from 'test/factories/makeQuestion';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';

let questionsRepository: InMemoryQuestionsRepository;
let sut: GetQuestionBySlugUseCase;

describe('Get Question By Slug  Use Case', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new GetQuestionBySlugUseCase(questionsRepository);
  });

  it('should be able to get a question by slug', async () => {
    const slug = faker.lorem.slug();

    const newQuestion = makeQuestion({ slug: Slug.create(slug) });

    await questionsRepository.create(newQuestion);

    const { question } = await sut.execute({
      slug,
    });

    expect(question.id).toBeTruthy();
    expect(question.title).toEqual(newQuestion.title);
  });
});
