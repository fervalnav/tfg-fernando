import type { DomainEvent } from './domain-event';

export abstract class AggregateRoot {
  private readonly _events: DomainEvent[] = [];

  protected record(event: DomainEvent): void {
    this._events.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._events];
    this._events.length = 0;
    return events;
  }
}
