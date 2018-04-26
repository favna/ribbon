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
 */

/**
 * @file Searches DefineCommand - Define a word using glosbe  
 * **Aliases**: `def`, `dict`
 * @module
 * @category searches
 * @name define
 * @example define Google
 * @param {string} Word the word you want to define
 * @returns {MessageEmbed} Possible definitions for that word
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class DefineCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'define',
      memberName: 'define',
      group: 'searches',
      aliases: ['def', 'dict'],
      description: 'Gets the definition on a word on glosbe',
      format: 'Word',
      examples: ['define pixel'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What word do you want to define?',
          type: 'string',
          parse: p => p.replace(/[^a-zA-Z]/g, '')
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const defineEmbed = new MessageEmbed(),
      word = await request.get('https://glosbe.com/gapi/translate')
        .query('from', 'en')
        .query('dest', 'en')
        .query('format', 'json')
        .query('phrase', args.query);

    if (word.ok && word.body.tuc && word.body.tuc.length > 0) {
      const final = [`**Definitions for __${args.query}__:**`];

      for (let [index, item] of Object.entries(word.body.tuc.filter(tuc => tuc.meanings)[0].meanings.slice(0, 5))) { // eslint-disable-line prefer-const

        item = item.text
          .replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, '\'')
          .replace(/<b>/g, '[')
          .replace(/<\/b>/g, ']')
          .replace(/<i>|<\/i>/g, '_');
        final.push(`**${(parseInt(index, 10) + 1)}:** ${item}`);
      }
      defineEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(final);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(defineEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`nothing found for \`${args.query}\`, maybe check your spelling?`);
  }
};