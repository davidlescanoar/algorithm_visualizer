export default class Queue {
    constructor() {
        this.queue = {};
        this.tail = 0;
        this.head = 0;
    }

    enqueue(element) {
        this.queue[this.tail] = element;
        this.tail++;
    }

    dequeue() {
        if(this.length) {
            const front = this.queue[this.head];
            delete this.queue[this.head];
            this.head++;
            return front;
        }
        return undefined;
    }

    get length() {
        return this.tail - this.head;
    }
}