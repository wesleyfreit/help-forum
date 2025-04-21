import { type Answer } from '@/domain/forum/enterprise/entities/answer';
import { faker } from '@faker-js/faker';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { CommentOnAnswerUseCase } from './comment-on-answer';

let answersRepository: InMemoryAnswersRepository;
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let answerCommentsRepository: InMemoryAnswerCommentsRepository;
let studentsRepository: InMemoryStudentsRepository;
let attachmentsRepository: InMemoryAttachmentsRepository;
let sut: CommentOnAnswerUseCase;

let newAnswer: Answer;

describe('Comment On Answer Use Case', () => {
  beforeEach(async () => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository();
    attachmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();
    answersRepository = new InMemoryAnswersRepository(
      attachmentsRepository,
      answerAttachmentsRepository,
      studentsRepository,
    );
    answerCommentsRepository = new InMemoryAnswerCommentsRepository(studentsRepository);
    sut = new CommentOnAnswerUseCase(answersRepository, answerCommentsRepository);

    newAnswer = makeAnswer();

    await answersRepository.create(newAnswer);
  });

  it('should be able to comment on answer', async () => {
    const content = faker.lorem.text();

    await sut.execute({
      answerId: newAnswer.id.toString(),
      authorId: newAnswer.authorId.toString(),
      content,
    });

    expect(answerCommentsRepository.items[0].content).toEqual(content);
  });
});
