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
 * @file nsfw PornVidsCommand - Gets a NSFW video from pornhub  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `porn`, `nsfwvids`
 * @module
 * @category nsfw
 * @name pornvids
 * @example pornvids babe
 * @param {StringResolvable} Query Something you want to find
 * @returns {MessageEmbed} URL, duration and embedded thumbnail
 */

const request = require('snekfetch'),
  {MessageEmbed} = require('discord.js'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PornVidsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pornvids',
      memberName: 'pornvids',
      group: 'nsfw',
      aliases: ['porn', 'nsfwvids'],
      description: 'Search porn videos',
      format: 'NSFWToLookUp',
      examples: ['pornvids babe'],
      guildOnly: false,
      nsfw: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'porn',
          prompt: 'What pornography do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {porn}) {
    try {
      startTyping(msg);
      const pornEmbed = new MessageEmbed(),
        vid = await request.get('https://www.pornhub.com/webmasters/search?').query('search', porn),
        vidRandom = Math.floor(Math.random() * vid.body.videos.length);

      pornEmbed
        .setURL(vid.body.videos[vidRandom].url)
        .setTitle(vid.body.videos[vidRandom].title)
        .setImage(vid.body.videos[vidRandom].default_thumb)
        .setColor('#FFB6C1')
        .addField('Porn video URL', `[Click Here](${vid.body.videos[vidRandom].url})`, true)
        .addField('Porn video duration', `${vid.body.videos[vidRandom].duration} minutes`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pornEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${porn}\``);
    }
  }
};