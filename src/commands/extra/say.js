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
 * @file Extra Say - Repeats a message and deletes your message  
 * **Aliases**: `sayd`, `repeat`
 * @module
 * @category extra
 * @name say
 * @example say Favna is a great coder!
 * @param {string} Text Message you want to have repeated
 * @returns {Message} Your message said by the bot
 */

const {Command} = require('discord.js-commando'), 
  {stopTyping, startTyping} = require('../../util.js');

module.exports = class SayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'extra',
      aliases: ['sayd', 'repeat'],
      description: 'I will repeat your message',
      format: 'MessageToSay',
      examples: ['say Favna is a great coder!'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'txt',
          prompt: 'What should I say?',
          type: 'string',
          validate: (rep, msg) => {
            if (msg.content.toLowerCase().includes('@here') ||
            msg.content.toLowerCase().includes('@everyone') ||
            msg.cleanContent.toLowerCase().includes('@here') ||
            msg.cleanContent.toLowerCase().includes('@everyone')) {
              msg.delete();

              return 'You cannot make me mention `@here` or `@everyone`! Would you like me to say anything else?';
            }

            return true;
          }
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    const saydata = {
      memberHexColor: msg.member.displayHexColor,
      commandPrefix: msg.guild.commandPrefix,
      authorTag: msg.author.tag,
      authorID: msg.author.id,
      avatarURL: msg.author.displayAvatarURL({format: 'png'}),
      messageDate: msg.createdAt,
      argString: msg.argString.slice(1)
    };

    this.client.provider.set(msg.guild.id, 'saydata', saydata);
    msg.delete();
    msg.say(args.txt);

    return stopTyping(msg);
  }
};