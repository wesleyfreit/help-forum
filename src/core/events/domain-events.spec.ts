import { AggregateRoot } from '../entities/aggregate-root';
import { UniqueEntityID } from '../entities/unique-entity-id';
import { DomainEvent } from './domain-event';
import { DomainEvents } from './domain-events';

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date;
  private aggregate: CustomAggregate;

  constructor(aggregate: CustomAggregate) {
    this.aggregate = aggregate;
    this.ocurredAt = new Date();
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregate.id;
  }
}

class CustomAggregate extends AggregateRoot<unknown> {
  static create() {
    const aggregate = new CustomAggregate(null);

    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));

    return aggregate;
  }
}

describe('Domain Events', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.fn();

    // Subscriber registered (listening the event "created response")
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);

    // Creating a response but WITHOUT saving it on database
    const aggregate = CustomAggregate.create();

    // Ensuring that the event was created but NOT dispatched yet
    expect(aggregate.domainEvents).toHaveLength(1);

    // Saving the response on database and dispatching the event
    DomainEvents.dispatchEventsForAggregate(aggregate.id);

    // Subscriber listen the event and the callback is called
    expect(callbackSpy).toHaveBeenCalled();
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
