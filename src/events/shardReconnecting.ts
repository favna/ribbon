import { stripIndents } from 'common-tags';
import { Event } from 'klasa';
import moment from 'moment';

export default class extends Event {
  run(shard: number) {
    this.client.console.error(stripIndents(
      `
          >>>>>>
            Shard is reconnecting!
            **Shard Number:** ${shard}
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          <<<<<<
        `
    ));
  }

  async init() {
    if (!this.client.options.production && !this.client.options.consoleEvents.debug) this.disable();
  }
}