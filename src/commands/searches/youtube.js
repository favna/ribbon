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
 * @file Searches YouTubeCommand - Find a video on YouTube  
 * By default returns MessageEmbed. use `yts` to return just the URL and have in-client playback  
 * **Aliases**: `yt`, `tube`, `yts`
 * @module
 * @category searches
 * @name youtube
 * @example youtube Voldemort Origins of the heir
 * @param {StringResolvable} VideoQuery Video to find on YouTube
 * @returns {MessageEmbed} Title, Channel, Publication Date and Description of the video
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class YouTubeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'youtube',
      memberName: 'youtube',
      group: 'searches',
      aliases: ['yt', 'tube', 'yts'],
      description: 'Find videos on youtube',
      format: 'VideoName',
      examples: ['youtube RWBY Volume 4'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'video',
          prompt: 'Which video do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {video}) {
    try {
      startTyping(msg);
      const embed = new MessageEmbed(),
        res = await request.get('https://www.googleapis.com/youtube/v3/search')
          .query('key', process.env.googleapikey)
          .query('part', 'snippet')
          .query('maxResults', '1')
          .query('q', video)
          .query('type', 'video');

      deleteCommandMessages(msg, this.client);
      if (msg.content.split(' ')[0].slice(msg.guild ? msg.guild.commandPrefix.length : this.client.commandPrefix.length) === 'yts') {
        stopTyping(msg);

        return msg.say(`https://www.youtube.com/watch?v=${res.body.items[0].id.videoId}`);
      }

      embed
        .setTitle(`Youtube Search Result ${res.body.items[0]}`)
        .setURL(`https://www.youtube.com/watch?v=${res.body.items[0].id.videoId}`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(res.body.items[0].snippet.thumbnails.high.url)
        .addField('Title', res.body.items[0].snippet.title, true)
        .addField('URL', `[Click Here](https://www.youtube.com/watch?v=${res.body.items[0].id.videoId})`, true)
        .addField('Channel', `[${res.body.items[0].snippet.channelTitle}](https://www.youtube.com/channel/${res.body.items[0].snippet.channelId})`, true)
        .addField('Published At', moment(res.body.items[0].snippet.publishedAt).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
        .addField('Description', res.body.items[0].snippet.description ? res.body.items[0].snippet.description : 'No Description', false);
      stopTyping(msg);

      return msg.embed(embed, `https://www.youtube.com/watch?v=${res.body.items[0].id.videoId}`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply(`no videos found for \`${video}\``);
    }
  }
};