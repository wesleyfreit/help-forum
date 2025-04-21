import { makeQuestion } from 'test/factories/make-question';
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository';
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions';

let questionsRepository: InMemoryQuestionsRepository;
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let attchmentsRepository: InMemoryAttachmentsRepository;
let studentsRepository: InMemoryStudentsRepository;
let sut: FetchRecentQuestionsUseCase;

describe('Fetch Recent Questions Use Case', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository();
    attchmentsRepository = new InMemoryAttachmentsRepository();
    studentsRepository = new InMemoryStudentsRepository();
    questionsRepository = new InMemoryQuestionsRepository(
      attchmentsRepository,
      questionAttachmentsRepository,
      studentsRepository,
    );
    sut = new FetchRecentQuestionsUseCase(questionsRepository);
  });

  it('should be able to fetch recent questions', async () => {
    await questionsRepository.create(makeQuestion({ createdAt: new Date(2025, 0, 20) }));
    await questionsRepository.create(makeQuestion({ createdAt: new Date(2025, 0, 18) }));
    await questionsRepository.create(makeQuestion({ createdAt: new Date(2025, 0, 23) }));

    const result = await sut.execute({
      page: 1,
    });

    expect(result.value?.recentQuestions).toEqual([
      expect.objectContaining({ createdAt: new Date(2025, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2025, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2025, 0, 18) }),
    ]);
  });

  it('should be able to fetch paginated recent questions', async () => {
    for (let i = 1; i <= 22; i++) {
      await questionsRepository.create(makeQuestion());
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.value?.recentQuestions).toHaveLength(2);
  });
});
