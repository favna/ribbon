import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { Command, Event, KlasaMessage } from 'klasa';
import moment from 'moment';

export default class extends Event {
  run(msg: KlasaMessage, command: Command, params: unknown[], error: Error) {
    const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;
    if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);

    if (isTextChannel(channel) && msg.author) {
      channel.send(stripIndents(
        `
          Caught **Command Error**!
          **Command:** ${command.name}
          ${msg.guild ? `**Server:** ${msg.guild.name} (${msg.guild.id})` : null}
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${error.message}
        `
      ));
    }

    if (error.message) msg.sendCode('JSON', error.message).catch(err => this.client.emit('wtf', err));
    else msg.sendMessage(error).catch(err => this.client.emit('wtf', err));
  }
}