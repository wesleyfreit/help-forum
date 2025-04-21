import { type Question } from '@/domain/forum/enterprise/entities/question';
import { faker } from '@faker-js/faker';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { CommentOnQuestionUseCase } from './comment-on-question';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let questionCommentsRepository: InMemoryQuestionCommentsRepository;
let studentsRepository: InMemoryStudentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let sut: CommentOnQuestionUseCase;

let newQuestion: Question;

describe('Comment On Question Use Case', () => {
  beforeEach(async () => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      attachmentsRepository,
      questionAttachmentsRepository,
      studentsRepository,
    );
    studentsRepository = new InMemoryStudentsRepository();
    questionCommentsRepository = new InMemoryQuestionCommentsRepository(
      studentsRepository,
    );
    sut = new CommentOnQuestionUseCase(questionsRepository, questionCommentsRepository);

    newQuestion = makeQuestion();

    await questionsRepository.create(newQuestion);
  });

  it('should be able to comment on question', async () => {
    const content = faker.lorem.text();

    await sut.execute({
      questionId: newQuestion.id.toString(),
      authorId: newQuestion.authorId.toString(),
      content,
    });

    expect(questionCommentsRepository.items[0].content).toEqual(content);
  });
});
