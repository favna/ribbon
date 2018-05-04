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
 * @file Extra CopyPastaCommand - Gets one of the server's stored copypastas  
 * Note: It is possible to get copypastas with more than 2000 characters. Ask me to add it through my server!  
 * **Aliases**: `cp`, `pasta`
 * @module
 * @category extra
 * @name copypasta
 * @example copypasta navy
 * @param {string} PastaName Name of the copypasta to send
 * @returns {MessageEmbed} Copypasta content. In a normal message if more than 1024 characters
 */

const dym = require('didyoumean2'),
  fs = require('fs'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class CopyPastaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypasta',
      memberName: 'copypasta',
      group: 'extra',
      aliases: ['cp', 'pasta'],
      description: 'Sends contents of a copypasta file to the chat',
      format: 'CopypastaName',
      examples: ['copypasta navy'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          prompt: 'Which copypasta should I send?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, {name}) {
    startTyping(msg);
    try {
      let pastaContent = fs.readFileSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}/${name}.txt`), 'utf8');

      if (pastaContent.length <= 1024) {
        /* eslint-disable no-nested-ternary */
        const cpEmbed = new MessageEmbed(),
          ext = pastaContent.includes('.png') ? '.png'
            : pastaContent.includes('.jpg') ? '.jpg'
              : pastaContent.includes('.gif') ? '.gif'
                : pastaContent.includes('.webp') ? '.webp' : 'none',
          header = ext !== 'none' ? pastaContent.includes('https') ? 'https' : 'http' : 'none';
        /* eslint-enable no-nested-ternary */

        if (ext !== 'none' && header !== 'none') {
          cpEmbed.setImage(`${pastaContent.substring(pastaContent.indexOf(header), pastaContent.indexOf(ext))}${ext}`);
          pastaContent = pastaContent.substring(0, pastaContent.indexOf(header) - 1) + pastaContent.substring(pastaContent.indexOf(ext) + ext.length);
        }

        cpEmbed
          .setDescription(pastaContent)
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00');

        msg.delete();
        stopTyping(msg);

        return msg.embed(cpEmbed);
      }
      msg.delete();
      stopTyping(msg);

      return msg.say(pastaContent, {split: true});
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      const matchList = fs.readdirSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}`)).map(v => v.slice(0, -4)),
        maybe = dym(name, matchList, {deburr: true});

      return msg.reply(oneLine`that copypasta does not exist! ${maybe 
        ? oneLine`Did you mean \`${maybe}\`?` 
        : `You can save it with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}copypastaadd <filename> <content>\``}`);
    }
  }
};