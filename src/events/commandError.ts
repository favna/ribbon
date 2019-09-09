import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { Command, Event, KlasaMessage } from 'klasa';
import moment from 'moment';

export default class CommandErrorEvent extends Event {
  run(message: KlasaMessage, command: Command, params: unknown[], error: Error) {
    const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;
    if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);

    if (isTextChannel(channel) && message.author) {
      channel.send(stripIndents(
        `
          Caught **Command Error**!
          **Command:** ${command.name}
          ${message.guild ? `**Server:** ${message.guild.name} (${message.guild.id})` : null}
          **Author:** ${message.author.tag} (${message.author.id})
          **Time:** ${moment(message.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${error.message}
        `
      ));
    }

    if (error.message) message.sendCode('JSON', error.message).catch(err => this.client.emit('wtf', err));
    else message.sendMessage(error).catch(err => this.client.emit('wtf', err));
  }
}