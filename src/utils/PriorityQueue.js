import Heap from './Heap';

export default class PriorityQueue extends Heap {
  constructor(iterable = [], comparator = (a, b) => a.x - b.x) {
    super(comparator);
    Array.from(iterable).forEach((el) => this.add(el));
  }

  enqueue(value) {
    super.add(value);
  }

  dequeue() {
    return super.remove();
  }
}