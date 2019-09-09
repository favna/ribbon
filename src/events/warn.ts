import { Event } from 'klasa';
import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import moment from 'moment';

export default class WarnEvent extends Event {
  run(warning: string) {
    const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

    if (channel && isTextChannel(channel)) {
      return channel.send(stripIndents(
        `
            Caught **General Warning**!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Warning Message:** ${warning}
          `
      ));
    }

    return this.client.console.warn(warning);
  }

  async init() {
    if (!this.client.options.consoleEvents.warn) this.disable();
  }
}