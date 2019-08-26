import { Event } from 'klasa';
import { isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';
import moment from 'moment';

export default class ErrorEvent extends Event {
  run(err: Error) {
    const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

    if (channel && isTextChannel(channel)) {
      channel.send(stripIndents(
        `
            Caught **WebSocket Error**!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err.message}
          `
      ));
    }

    return this.client.console.error(err);
  }

  async init() {
    if (!this.client.options.consoleEvents.error) this.disable();
  }
}