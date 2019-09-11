import { Event } from 'klasa';

export default class extends Event {
  run(warning: string) {
    if (this.client.ready) this.client.console.debug(warning);
  }

  async init() {
    if (!this.client.options.consoleEvents.debug) this.disable();
  }
}