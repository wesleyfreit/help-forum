import { type Question } from '@/domain/forum/enterprise/entities/question';
import { randomUUID } from 'crypto';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { DeleteQuestionUseCase } from './delete-question';
import { NotAllowedError } from './errors/not-allowed-error';

let questionsRepository: InMemoryQuestionsRepository;
let sut: DeleteQuestionUseCase;

let newQuestion: Question;

describe('Delete Question Use Case', () => {
  beforeEach(async () => {
    questionsRepository = new InMemoryQuestionsRepository();
    sut = new DeleteQuestionUseCase(questionsRepository);

    newQuestion = makeQuestion();
    await questionsRepository.create(newQuestion);
  });

  it('should be able to delete a question', async () => {
    await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
    });

    expect(questionsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a question from another user', async () => {
    const result = await sut.execute({
      authorId: randomUUID(),
      questionId: newQuestion.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
