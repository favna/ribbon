/**
 * @file Info ActivityCommand - Gets the activity (presence) data from a member  
 * **Aliases**: `act`, `presence`, `richpresence`
 * @module
 * @category info
 * @name activity
 * @example activity Favna
 * @param {GuildMemberResolvable} member Member to get the activity for
 * @returns {MessageEmbed} Activity from that member
 */

const Spotify = require('spotify-web-api-node'),
  duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  fetch = require('node-fetch'),
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ActivityCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'activity',
      memberName: 'activity',
      group: 'info',
      aliases: ['act', 'presence', 'richpresence'],
      description: 'Gets the activity (presence) data from a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['activity Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to get the activity from?',
          type: 'member'
        }
      ]
    });
  }

  convertType (type) {
    return type.toLowerCase() !== 'listening' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Listening to';
  }

  fetchExt (str) {
    return str.slice(-4);
  }

  /* eslint complexity: ["error", 45], max-statements: ["error", 35]*/
  async run (msg, {member}) {
    try {
      startTyping(msg);
      const {activity} = member.presence,
        ava = member.user.displayAvatarURL(),
        embed = new MessageEmbed(),
        ext = this.fetchExt(ava),
        games = await fetch('https://canary.discordapp.com/api/v6/applications'),
        gameList = await games.json(),
        gameIcon = gameList.find(g => g.name === activity.name),
        spotifyApi = new Spotify({
          clientId: process.env.spotifyid,
          clientSecret: process.env.spotifysecret
        });

      let spotify = {};

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setAuthor(member.user.tag, ava, `${ava}?size2048`)
        .setThumbnail(ext.includes('gif') ? `${ava}&f=.gif` : ava);

      if (!activity) throw new Error('noActivity');
      if (activity.type === 'LISTENING' && activity.name === 'Spotify') {

        const spotTokenReq = await spotifyApi.clientCredentialsGrant();

        if (spotTokenReq) {
          spotifyApi.setAccessToken(spotTokenReq.body.access_token);

          const spotifyData = await spotifyApi.searchTracks(`track:${activity.details} artist:${typeof activity.state === 'object' ? activity.state[0] : activity.state.split(';')[0]}`); // eslint-disable-line

          if (spotifyData) {
            spotify = spotifyData.body.tracks.items[0];
            activity.state = typeof activity.state === 'object' ? activity.state : activity.state.split(';');
            for (const i in spotify.artists.length) {
              activity.state[i] = `[${activity.state[i]}](${spotify.artists[i].external_urls.spotify})`;
            }
          }
        }
      }

      gameIcon ? embed.setThumbnail(`https://cdn.discordapp.com/game-assets/${gameIcon.id}/${gameIcon.icon}.png`) : null;
      embed.addField(this.convertType(activity.type), activity.name, true);

      activity.url ? embed.addField('URL', `[${activity.url.slice(8)}](${activity.url})`, true) : null;
      activity.details
        ? embed.addField('Details', activity.type === 'LISTENING' && activity.name === 'Spotify'
          ? `[${activity.details}](${spotify.external_urls.spotify})`
          : activity.details, true)
        : null;

      activity.state
        ? embed.addField('State', activity.type === 'LISTENING' && activity.name === 'Spotify'
          ? `by ${activity.state.join(',')}`
          : activity.state, true)
        : null;

      activity.party && activity.party.size ? embed.addField('Party Size', `${activity.party.size[0]} of ${activity.party.size[1]}`, true) : null;

      activity.assets && activity.assets.largeImage
        ? embed.setThumbnail(!activity.assets.largeImage.includes('spotify')
          ? `https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.largeImage}.png`
          : `https://i.scdn.co/image/${activity.assets.largeImage.split(':')[1]}`)
        : null;

      /* eslint-disable no-nested-ternary*/
      activity.timestamps && activity.timestamps.start
        ? embed.setFooter('Start Time') && embed.setTimestamp(activity.timestamps.start) && activity.timestamps.end
          ? embed.addField('End Time', `${moment.duration(activity.timestamps.end - Date.now()).format('HH[:]mm[:]ss [seconds left]')}`, true)
          : null
        : null;

      activity.assets && activity.assets.smallImage
        ? embed.setFooter(activity.assets.smallText
          ? activity.timestamps && activity.timestamps.start
            ? `${activity.assets.smallText} | Start Time`
            : activity.assets.smallText
          : activity.timestamps && activity.timestamps.start
            ? 'Start Time'
            : '​', !activity.assets.smallImage.includes('spotify')
          ? `https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.smallImage}.png`
          : `https://i.scdn.co/image/${activity.assets.smallImage.split(':')[1]}`)
        : null;
      /* eslint-enable no-nested-ternary*/

      activity.assets && activity.assets.largeText
        ? embed.addField('Large Text', activity.type === 'LISTENING' && activity.name === 'Spotify'
          ? `on [${activity.assets.largeText}](${spotify.album.external_urls.spotify})`
          : activity.assets.largeText, true)
        : null;

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      stopTyping(msg);
      if ((/(noActivity|Cannot read property 'name' of null)/i).test(err.toString())) {
        return msg.embed({
          color: msg.guild ? msg.guild.me.displayColor : 8190976,
          author: {
            name: member.user.tag,
            url: `${member.user.displayAvatarURL()}?size=2048`,
            iconURL: member.user.displayAvatarURL()
          },
          thumbnail: {url: member.user.displayAvatarURL()},
          fields: [
            {
              name: 'Activity',
              value: 'Nothing',
              inline: true
            }
          ]
        });
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`fortnite\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Member:** ${member.user.tag} (${member.id})
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};