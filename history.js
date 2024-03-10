export class History {
    constructor(initial) {
        this.currentIndex = 0;
        this.history = [initial];
    }
    current() {
        return this.history[this.currentIndex];
    }
    push(stateDelta) {
        const newState = Object.assign({}, this.current(), stateDelta);
        if (JSON.stringify(newState) === JSON.stringify(this.current())) {
            // no change, do nothing
            return;
        }
        this.history.length = this.currentIndex + 1;
        this.history.push(newState);
        this.currentIndex += 1;
    }
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
        }
    }
    /** Return true if the history only contains the initial state */
    isEmpty() {
        return this.history.length === 1;
    }
}
