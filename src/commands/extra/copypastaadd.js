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
 * @file Extra CopyPastaAddCommand - Adds a new copypasta for your server  
 * **Aliases**: `cpadd`, `pastaadd`
 * @module
 * @category extra
 * @name copypastaadd
 * @example copypastaadd lipsum Lorem ipsum dolor sit amet. 
 * @param {string} PasteName Name for the new pasta
 * @param {string} PastaContent Content for the new pasta
 * @returns {Message} Confirmation the copypasta was added
 */

const fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class CopyPastaAddCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypastaadd',
      memberName: 'copypastaadd',
      group: 'extra',
      aliases: ['cpadd', 'pastaadd'],
      description: 'Saves a copypasta to local file',
      format: 'CopypastaName CopypastaContent',
      examples: ['copypasta navy what the fuck did you just say to me ... (etc.)'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },

      args: [
        {
          key: 'name',
          prompt: 'What is the name of the copypasta you want to save?',
          type: 'string',
          parse: p => p.toLowerCase()
        },
        {
          key: 'content',
          prompt: 'What should be stored in the copypasta?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    if (!fs.existsSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}`))) {
      console.log(`Creating guild dir for guild ${msg.guild.name}(${msg.guild.id}) at ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`);
      fs.mkdirSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}`));
    }

    fs.writeFileSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}/${args.name}.txt`), args.content, 'utf8');

    if (fs.existsSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}/${args.name}.txt`))) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`Copypasta stored in ${args.name}.txt. You can summon it with ${msg.guild.commandPrefix}copypasta ${args.name}`);
    }
    stopTyping(msg);

    return msg.reply('an error occurred and your pasta was not saved.');
  }
};