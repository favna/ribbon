/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Info ActivityCommand - Gets the activity (presence) data from a member  
 * **Aliases**: `act`, `presence`, `richpresence`
 * @module
 * @category info
 * @name Activity
 * @example activity Favna
 * @param {member} member Member to get the activity for
 * @returns {MessageEmbed} Activity from that member
 */

const Spotify = require('spotify-web-api-node'),
  duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

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
  /* eslint-disable no-nested-ternary*/
  async run (msg, args) {
    startTyping(msg);
    const {activity} = args.member.presence,
      ava = args.member.user.displayAvatarURL(),
      embed = new MessageEmbed(),
      ext = this.fetchExt(ava),
      gameList = await request.get('https://canary.discordapp.com/api/v6/games'),
      spotifyApi = new Spotify({
        clientId: process.env.spotifyid,
        clientSecret: process.env.spotifysecret
      });

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setAuthor(args.member.user.tag, ava, `${ava}?size2048`)
      .setThumbnail(ext.includes('gif') ? `${ava}&f=.gif` : ava);

    if (activity) {
      const gameIcon = gameList.body.find(g => g.name === activity.name);

      let spotify = {};

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
          ? `https://cdn.discordapp.com/app-assets/${activity.appID}/${activity.assets.largeImage}.png`
          : `https://i.scdn.co/image/${activity.assets.largeImage.split(':')[1]}`)
        : null;

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
          ? `https://cdn.discordapp.com/app-assets/${activity.appID}/${activity.assets.smallImage}.png`
          : `https://i.scdn.co/image/${activity.assets.smallImage.split(':')[1]}`)
        : null;

      activity.assets && activity.assets.largeText
        ? embed.addField('Large Text', activity.type === 'LISTENING' && activity.name === 'Spotify'
          ? `on [${activity.assets.largeText}](${spotify.album.external_urls.spotify})`
          : activity.assets.largeText, true)
        : null;

      activity.appID ? embed.addField('Application ID', activity.appID, true) : null;

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    }
    embed.addField('Activity', 'Nothing', true);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};