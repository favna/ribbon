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
 * @file nsfw e621Command - Gets a NSFW image from e621  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `eee`
 * @module
 * @category nsfw
 * @name e621
 * @example e621 pyrrha_nikos
 * @param {string} Query Something you want to find
 * @returns {MessageEmbed} Score, Link and preview of the image
 */

const booru = require('booru'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class e621Command extends Command {
  constructor (client) {
    super(client, {
      name: 'e621',
      memberName: 'e621',
      group: 'nsfw',
      aliases: ['eee'],
      description: 'Find NSFW Content on e621',
      format: 'NSFWToLookUp',
      examples: ['e621 Pyrrha Nikos'],
      guildOnly: false,
      nsfw: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'tags',
          prompt: 'What do you want to find NSFW for?',
          type: 'string',
          parse: p => p.split(' ')
        }
      ]
    });
  }

  async run (msg, args) {
    try {
      startTyping(msg);
      /* eslint-disable sort-vars*/
      const search = await booru.search('e621', args.tags, {
          limit: 1,
          random: true
        }),
        common = await booru.commonfy(search),
        embed = new MessageEmbed(),
        tags = [];
      /* eslint-enable sort-vars*/

      for (const tag in common[0].common.tags) {
        tags.push(`[#${common[0].common.tags[tag]}](${common[0].common.file_url})`);
      }

      embed
        .setTitle(`e621 image for ${args.tags.join(', ')}`)
        .setURL(common[0].common.file_url)
        .setColor('#FFB6C1')
        .setDescription(stripIndents`${tags.slice(0, 5).join(' ')}
          
          **Score**: ${common[0].common.score}`)
        .setImage(common[0].common.file_url);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no juicy images found for \`${args.tags}\``);
    }
  }
};