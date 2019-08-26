import { Event } from 'klasa';
import { Guild } from 'discord.js';
import moment from 'moment';
import FirebaseStorage from '@components/FirebaseStorage';
import { setServersData } from '@components/FirebaseActions';
import { isTextChannel } from '@components/Utils';
import { stripIndents } from 'common-tags';

export default class GuildDeleteEvent extends Event {
  run(guild: Guild) {
    try {
      let serverCount = FirebaseStorage.servers;
      serverCount--;

      FirebaseStorage.servers = serverCount;
      setServersData(serverCount.toString());
    } catch (err) {
      const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

      if (isTextChannel(logChannel)) {
        logChannel.send(stripIndents(
          `
            ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, I failed to update Firebase guilds count when leaving guild!
            **Guild Data:** ${guild.name} (${guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
          `
        ));
      }
    }
  }
}