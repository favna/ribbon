import { stripIndents } from 'common-tags';
import { Event } from 'klasa';
import moment from 'moment';

export default class ShardErrorEvent extends Event {
  run(event: Error, shard: number) {
    this.client.console.error(stripIndents(
      `
          >>>>>>
              Shard encountered a connection error!
              **Shard Number:** ${shard}
              **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              **Error Message:** ${event.message}
          <<<<<<
        `
    ));
  }

  async init() {
    if (!this.client.options.production && !this.client.options.consoleEvents.debug) this.disable();
  }
}