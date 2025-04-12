import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository';
import { SendNotificationUseCase } from './send-notification';

let notificationsRepository: InMemoryNotificationsRepository;
let sut: SendNotificationUseCase;

describe('Create Notification Use Case', () => {
  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository();
    sut = new SendNotificationUseCase(notificationsRepository);
  });

  it('should be able to create a notification', async () => {
    const result = await sut.execute({
      recipientId: randomUUID(),
      title: faker.lorem.sentence(),
      content: faker.lorem.text(),
    });

    expect(result.isRight()).toBe(true);
    expect(notificationsRepository.items[0]).toEqual(result.value?.notification);
  });
});
