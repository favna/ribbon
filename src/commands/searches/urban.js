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
 * @file Searches UrbanCommand - Define a word using UrbanDictionary  
 * **Aliases**: `ub`, `ud`
 * @module
 * @category searches
 * @name urban
 * @example urban Everclear
 * @param {string} PhraseQuery Phrase that you want to define
 * @returns {MessageEmbed} Top definition for the requested phrase
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class UrbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'urban',
      memberName: 'urban',
      group: 'searches',
      aliases: ['ub', 'ud'],
      description: 'Find definitions on urban dictionary',
      format: 'Term',
      examples: ['urban ugt'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What word do you want to define?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const urban = await request.get('https://api.urbandictionary.com/v0/define').query('term', args.query);

    if (urban.ok && urban.body.result_type !== 'no_results') {
      const embed = new MessageEmbed();

      urban.body.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

      embed
        .setTitle(`Urban Search - ${urban.body.list[0].word}`)
        .setURL(urban.body.list[0].permalink)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(urban.body.list[0].definition)
        .addField('Example',
          urban.body.list[0].example.length <= 1024
            ? urban.body.list[0].example
            : `Truncated due to exceeding maximum length\n${urban.body.list[0].example.slice(0, 970)}`,
          false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`no definitions found for \`${args.query}\``);
  }
};