import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository';
import { Notification } from '@/domain/notification/enterprise/entities/notification';

export class InMemoryNotificationsRepository implements NotificationsRepository {
  public items: Notification[] = [];

  async create(notification: Notification) {
    this.items.push(notification);
  }

  async findById(notificationId: string): Promise<Notification | null> {
    const notification = this.items.find((item) => item.id.toString() === notificationId);

    if (!notification) {
      return null;
    }

    return notification;
  }

  async save(notification: Notification) {
    const notificationIndex = this.items.findIndex(
      (item) => item.id.toString() === notification.id.toString(),
    );

    this.items[notificationIndex] = notification;
  }
}
