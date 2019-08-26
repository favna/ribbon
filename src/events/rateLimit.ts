import { Event, Colors } from 'klasa';
import { RateLimitData } from 'discord.js';

const HEADER = new Colors({text: 'red'}).format('[RATELIMIT]');

export default class RateLimitEvent extends Event {
  run(rtData: RateLimitData) {
    this.client.emit('verbose', [
      HEADER,
      `Timeout: ${rtData.timeout}ms`,
      `Limit: ${rtData.limit} requests`,
      `Method: ${rtData.method.toUpperCase()}`,
      `Route: ${rtData.route}`
    ].join('\n'));
  }

  async init() {
    if (!this.client.options.production) this.disable();
  }
}