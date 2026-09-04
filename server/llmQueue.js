// Simple FIFO queue with concurrency limit 1 and timeout protection
class LLMQueue {
  constructor(timeoutMs = 25000) {
    this.timeoutMs = timeoutMs;
    this.queue = [];
    this.running = false;
  }

  async run(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.running || this.queue.length === 0) return;

    this.running = true;
    const { taskFn, resolve, reject } = this.queue.shift();

    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error('AI request timed out in queue'));
      }
    }, this.timeoutMs);

    try {
      const result = await taskFn();
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(result);
      }
    } catch (err) {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        reject(err);
      }
    } finally {
      this.running = false;
      this.processNext();
    }
  }
}

export const llmQueue = new LLMQueue(25000);
