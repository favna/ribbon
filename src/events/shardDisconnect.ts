import { stripIndents } from 'common-tags';
import { Event } from 'klasa';
import moment from 'moment';

export default class ShardDisconnectedEvent extends Event {
  run(event: CloseEvent, shard: number) {
    this.client.console.error(stripIndents(
      `
          >>>>>>
              Shard Disconnected, warning, it will not reconnect!
              **Shard Number:** ${shard}
              **Close Event Code:** ${event.code}
              **Close Event Reason:** ${event.reason}
              **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          <<<<<<
        `
    ));
  }

  async init() {
    if (!this.client.options.production && !this.client.options.consoleEvents.debug) this.disable();
  }
}