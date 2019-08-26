import { Event, KlasaMessage, Command } from 'klasa';
import FirebaseStorage from '@components/FirebaseStorage';
import { setCommandsData } from '@components/FirebaseActions';
import moment from 'moment';
import { isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';

export default class CommandRunEvent extends Event {
  run(msg: KlasaMessage, command: Command) {
    try {
      if (command.category === 'owner') return;

      let commandsCount = FirebaseStorage.commands;
      commandsCount++;

      FirebaseStorage.commands = commandsCount;
      setCommandsData(String(commandsCount));
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

      if (channel && isTextChannel(channel) && isTextChannel(msg.channel) && msg.guild) {
        channel.send(stripIndents(
          `
          ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, failed to update Firebase commands count!
            **Message ID:** (${msg.id})
            **Channel Data:** ${msg.channel.name} (${msg.channel.id})
            **Guild Data:** ${msg.guild.name} (${msg.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }
}