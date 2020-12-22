export class History<T> {
    private readonly history: T[];
    private currentIndex = 0;

    constructor(initial: T) {
        this.history = [initial];
    }

    current(): T {
        return this.history[this.currentIndex];
    }

    push(stateDelta: Partial<T>): void {
        const newState: T = Object.assign({}, this.current(), stateDelta);
        if (JSON.stringify(newState) === JSON.stringify(this.current())) {
            // no change, do nothing
            return;
        }

        this.history.length = this.currentIndex + 1;
        this.history.push(newState);
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

    /** Return true if the history only contains the initial state */
    isEmpty(): boolean {
        return this.history.length === 1;
    }
}
