import { Event, EventOptions } from 'klasa';
import { ApplyOptions } from '@components/Utils';
import { stripIndents } from 'common-tags';
import moment from 'moment';

@ApplyOptions<EventOptions>({emitter: process})
export default class UnhandledRejectionEvent extends Event {
  run(err: Error) {
    if (!err) return;

    this.client.emit('error', stripIndents(
      `
      **Uncaught Promise Error**:
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      ${err.stack || err}
      `
    ));
  }
}