import { setMessagesData } from '@components/FirebaseActions';
import FirebaseStorage from '@components/FirebaseStorage';
import { ApplyOptions, isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';
import { KlasaMessage, Monitor, MonitorOptions } from 'klasa';
import moment from 'moment';

@ApplyOptions<MonitorOptions>({
  name: 'firebaseUpdate',
  enabled: true,
  ignoreSelf: false,
})
export default class MessageMonitor extends Monitor {
  async run(msg: KlasaMessage) {
    const guild = msg.guild;

    try {
      let messagesCount = FirebaseStorage.messages;
      messagesCount++;

      FirebaseStorage.messages = messagesCount;
      setMessagesData(String(messagesCount));
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!);

      if (channel && isTextChannel(channel) && isTextChannel(msg.channel) && guild) {
        channel.send(stripIndents(
          `
          ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, failed to update Firebase messages count!
          **Message ID:** (${msg.id})
          **Channel Data:** ${msg.channel.name} (${msg.channel.id})
          **Guild Data:** ${guild.name} (${guild.id})
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err}
          `
        ));
      }
    }
  }
}