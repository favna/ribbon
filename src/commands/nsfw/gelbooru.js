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
 * Gets a NSFW image from gelbooru  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `gel`, `booru`
 * @module
 * @category nsfw
 * @name gelbooru
 * @example gelbooru pyrrha_nikos
 * @param {string} Query Something you want to find
 * @returns {MessageEmbed} Score, Link and preview of the image
 */

const {MessageEmbed} = require('discord.js'),
  booru = require('booru'),
  commando = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class gelbooruCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'gelbooru',
      'memberName': 'gelbooru',
      'group': 'nsfw',
      'aliases': ['gel', 'booru'],
      'description': 'Find NSFW Content on gelbooru',
      'format': 'NSFWToLookUp',
      'examples': ['gelbooru Pyrrha Nikos'],
      'guildOnly': false,
      'nsfw': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'nsfwtags',
          'prompt': 'What do you want to find NSFW for?',
          'type': 'string',
          'parse': p => p.split(' ')
        }
      ]
    });
  }

  async run (msg, args) {
    /* eslint-disable sort-vars*/
    const search = await booru.search('gelbooru', args.nsfwtags, {
        'limit': 1,
        'random': true
      }),
      common = await booru.commonfy(search);
    /* eslint-enable sort-vars*/

    if (common && common[0].common) {
      console.log(common[0]);
      const embed = new MessageEmbed(),
        tags = [];

      for (const tag in common[0].common.tags) {
        tags.push(`[#${common[0].common.tags[tag]}](${common[0].common.file_url})`);
      }

      embed
        .setTitle(`gelbooru image for ${args.nsfwtags.join(', ')}`)
        .setURL(common[0].common.file_url)
        .setColor('#FFB6C1')
        .setDescription(stripIndents `${tags.slice(0, 5).join(' ')}
				
				**Score**: ${common[0].common.score}`)
        .setImage(common[0].common.file_url);

      deleteCommandMessages(msg, this.client);

      return msg.embed(embed);
    }

    deleteCommandMessages(msg, this.client);

    return msg.reply('⚠️ No juicy images found.');
  }
};