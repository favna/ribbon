import { setChannelsData } from '@utils/FirebaseActions';
import FirebaseStorage from '@utils/FirebaseStorage';
import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { Channel, GuildChannel } from 'discord.js';
import { Event } from 'klasa';
import moment from 'moment';

export default class extends Event {
  run(channel: Channel) {
    if (channel.type === 'category' || channel.type === 'dm') return;

    try {
      let channelsCount = FirebaseStorage.channels;
      channelsCount--;

      FirebaseStorage.channels = channelsCount;
      setChannelsData(channelsCount.toString());
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel) && isTextChannel(channel)) {
        logChannel.send(stripIndents(
          `
          ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to update Firebase channnels count!
          **Type:** Create Delete
          **Channel Data:** ${channel.name} (${channel.id})
          **Guild Data:** ${channel.guild.name} (${(channel as GuildChannel).guild.id})
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err}
          `
        ));
      }
    }
  }
}