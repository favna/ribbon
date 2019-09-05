import { stripIndents } from 'common-tags';
import { Event } from 'klasa';
import moment from 'moment';

export default class ShardResumedEvent extends Event {
  run(shard: number, replayedEvents: number) {
    this.client.console.error(stripIndents(
      `
          >>>>>>
            Shard is resumed successfully!
            **Shard Number:** ${shard}
            **Amount of replayed events:** ${replayedEvents}
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          <<<<<<
        `
    ));
  }

  async init() {
    if (!this.client.options.production && !this.client.options.consoleEvents.debug) this.disable();
  }
}