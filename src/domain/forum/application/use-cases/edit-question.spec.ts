import { type Question } from '@/domain/forum/enterprise/entities/question';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { EditQuestionUseCase } from './edit-question';

let questionsRepository: InMemoryQuestionsRepository;
let sut: EditQuestionUseCase;

let newQuestion: Question;

describe('Edit Question Use Case', () => {
  beforeEach(async () => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new EditQuestionUseCase(questionsRepository);

    newQuestion = makeQuestion();
    await questionsRepository.create(newQuestion);
  });

  it('should be able to edit a question', async () => {
    const title = faker.lorem.sentence();
    const content = faker.lorem.text();

    await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
      title,
      content,
    });

    expect(questionsRepository.items[0]).toMatchObject({
      title,
      content,
    });
  });

  it('should not be able to edit a question from another user', async () => {
    await expect(
      sut.execute({
        authorId: randomUUID(),
        questionId: newQuestion.id.toString(),
        title: faker.lorem.sentence(),
        content: faker.lorem.text(),
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});
