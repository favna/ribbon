import { ApplyOptions } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { Event, EventOptions } from 'klasa';
import moment from 'moment';

@ApplyOptions<EventOptions>({emitter: process})
export default class extends Event {
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