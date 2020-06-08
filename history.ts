export class History<T> {
    private readonly history: T[];
    private currentIndex = 0;

    constructor(initial: T) {
        this.history = [initial];
    }

    current(): T {
        return this.history[this.currentIndex];
    }

    push(state: T): void {
        if (JSON.stringify(state) === JSON.stringify(this.current())) {
            // no change, do nothing
            return;
        }
        this.history.length = this.currentIndex + 1;
        this.history.push(state);
        this.currentIndex += 1;
    }

    undo(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    redo(): void {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
        }
    }
}
