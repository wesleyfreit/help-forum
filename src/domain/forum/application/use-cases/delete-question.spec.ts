import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { type Question } from '@/domain/forum/enterprise/entities/question';
import { randomUUID } from 'crypto';
import { makeQuestion } from 'test/factories/make-question';
import { makeQuestionAttachment } from 'test/factories/make-question-attachment';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { DeleteQuestionUseCase } from './delete-question';
import { NotAllowedError } from './errors/not-allowed-error';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let sut: DeleteQuestionUseCase;

let newQuestion: Question;

describe('Delete Question Use Case', () => {
  beforeEach(async () => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository);
    sut = new DeleteQuestionUseCase(questionsRepository);

    newQuestion = makeQuestion();
    await questionsRepository.create(newQuestion);

    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        attachmentId: new UniqueEntityID('1'),
        questionId: newQuestion.id,
      }),
      makeQuestionAttachment({
        attachmentId: new UniqueEntityID('2'),
        questionId: newQuestion.id,
      }),
    );
  });

  it('should be able to delete a question', async () => {
    await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
    });

    expect(questionsRepository.items).toHaveLength(0);
    expect(questionAttachmentsRepository.items).toHaveLength(0);
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
