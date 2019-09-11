import stringify from '@favware/querystring';
import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@extensions/RibbonEmbed';
import { isTextChannel } from '@utils/Utils';
import { stripIndents } from 'common-tags';
import { GuildMember } from 'discord.js';
import { Event } from 'klasa';
import moment from 'moment';

export default class extends Event {
  async run(oldMember: GuildMember, newMember: GuildMember) {
    const guild = newMember.guild;

    if (guild.settings.get(GuildSettings.twitchEnabled)) {
      const users = guild.settings.get(GuildSettings.twitchUsers) as GuildSettings.twitch['users'];
      if (users.map(user => user.id).includes(newMember.id)) {
        const curDisplayName = newMember.displayName;
        const curGuild = newMember.guild;
        const curUser = newMember.user;
        const twitchChannel = guild.settings.get(GuildSettings.twitchChannel) as GuildSettings.twitch['channel'];
        let newActivity = newMember.presence.activity;
        let oldActivity = oldMember.presence.activity;

        try {
          if (!oldActivity) {
            oldActivity = {
              applicationID: '',
              assets: {
                largeImage: '',
                largeImageURL: () => '',
                largeText: '',
                smallImage: '',
                smallImageURL: () => '',
                smallText: '',
              },
              details: '',
              equals: () => false,
              name: '',
              party: { id: '', size: [ 0, 0 ] },
              state: '',
              timestamps: { start: new Date(), end: new Date() },
              type: 'STREAMING',
              url: 'placeholder',
            };
          }
          if (!newActivity) {
            newActivity = {
              applicationID: '',
              assets: {
                largeImage: '',
                largeImageURL: () => '',
                largeText: '',
                smallImage: '',
                smallImageURL: () => '',
                smallText: '',
              },
              details: '',
              equals: () => false,
              name: '',
              party: { id: '', size: [ 0, 0 ] },
              state: '',
              timestamps: { start: new Date(), end: new Date() },
              type: 'STREAMING',
              url: 'placeholder',
            };
          }
          if (!/(twitch)/i.test(oldActivity.url!) && /(twitch)/i.test(newActivity.url!)) {
            const TWITCH_PURPLE = '#6441A4';
            const userFetch = await fetch(`https://api.twitch.tv/helix/users?${stringify({ login: newActivity.url!.split('/')[3] })}`,
              { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID! } });
            const userData = await userFetch.json();
            const streamFetch = await fetch(`https://api.twitch.tv/helix/streams?${stringify({ channel: userData.data[0].id })}`,
              { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID! } });
            const streamData = await streamFetch.json();
            const twitchEmbed = new RibbonEmbed(this.client.user!)
              .setThumbnail(curUser.displayAvatarURL())
              .setURL(newActivity.url!)
              .setColor(TWITCH_PURPLE)
              .setTitle(`${curDisplayName} just went live!`)
              .setDescription(stripIndents(
                `
                  streaming \`${newActivity.details}\`!\n\n**Title:**\n${newActivity.name}
                `
              ));

            if (userFetch.ok && userData.data.length > 0 && userData.data[0]) {
              twitchEmbed
                .setThumbnail(userData.data[0].profile_image_url)
                .setTitle(`${userData.data[0].display_name} just went live!`)
                .setDescription(stripIndents`
                  ${userData.data[0].display_name} just started ${twitchEmbed.description}`)
                .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${userData.data[0].login}-1920x1080.jpg`);
            }

            if (streamFetch.ok && streamData.data.length > 0 && streamData.data[0]) {
              const streamTime = moment(streamData.data[0].started_at).isValid() ?
                moment(streamData.data[0].started_at).toDate() :
                null;

              twitchEmbed.setFooter('Stream started');
              if (streamTime) twitchEmbed.setTimestamp(streamTime);
            }
            if (twitchChannel) {
              twitchChannel.send('', { embed: twitchEmbed });
            }
          }
        } catch (err) {
          const logChannel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!)!;

          if (isTextChannel(logChannel)) {
            logChannel.send(stripIndents(
              `
                ${this.client.options.owners.map(owner => `<@${owner}>`).join(' and ')}, failed to say goodbye to a member!
                **Server:** ${curGuild.name} (${curGuild.id})
                **Member:** ${curUser.tag} (${curUser.id})
                **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Old Activity:** ${oldActivity!.url}
                **New Activity:** ${newActivity!.url}
                **Error Message:** ${err}
              `
            ));
          }
        }
      }
    }
  }
}