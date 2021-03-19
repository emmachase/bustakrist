export type CancelSubscription = () => void;

export class Subject<T> {
  private observers: ((x: T) => void)[] = [];

  public next(value: T) {
    for (const o of this.observers) {
      o(value);
    }
  }

  public subscribe(cb: (value: T) => void): CancelSubscription {
    this.observers.push(cb);

    return () => {
      const idx = this.observers.indexOf(cb);
      if (idx !== -1) {
        this.observers.splice(idx, 1);
      }
    };
  }
}
