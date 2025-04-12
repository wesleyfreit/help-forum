import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { randomUUID } from 'node:crypto';
import { makeNotification } from 'test/factories/make-notification';
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository';
import { Notification } from '../../enterprise/entities/notification';
import { ReadNotificationUseCase } from './read-notification';

let notificationsRepository: InMemoryNotificationsRepository;
let sut: ReadNotificationUseCase;

let newNotification: Notification;

describe('Read Notification Use Case', () => {
  beforeEach(async () => {
    notificationsRepository = new InMemoryNotificationsRepository();
    sut = new ReadNotificationUseCase(notificationsRepository);

    newNotification = makeNotification();
    await notificationsRepository.create(newNotification);
  });

  it('should be able to read a notification', async () => {
    const result = await sut.execute({
      recipientId: newNotification.recipientId.toString(),
      notificationId: newNotification.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(notificationsRepository.items[0].readAt).toEqual(expect.any(Date));
  });

  it('should not be able to read a notification from another user', async () => {
    const result = await sut.execute({
      recipientId: randomUUID(),
      notificationId: newNotification.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
