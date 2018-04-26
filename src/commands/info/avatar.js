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
 * @file Games AvatarCommand - Get the avatar from any member  
 * **Aliases**: `ava`
 * @module
 * @category info
 * @name avatar
 * @example avatar Favna
 * @param {member} MemberName Member to get the avatar from
 * @param {member} [ImageSize] Optional: Size of the avatar to get. Defaults to 1024
 * @returns {MessageEmbed} The avatar image and a direct link to it
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      memberName: 'avatar',
      group: 'info',
      aliases: ['ava'],
      description: 'Gets the avatar from a user',
      format: 'MemberID|MemberName(partial or full) [ImageSize]',
      examples: ['avatar Favna 2048'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to get the avatar from?',
          type: 'member'
        },
        {
          key: 'size',
          prompt: 'What size do you want the avatar to be? (Valid sizes: 128, 256, 512, 1024, 2048)',
          type: 'integer',
          default: 1024,
          validate: (size) => {
            const validSizes = ['128', '256', '512', '1024', '2048'];

            if (validSizes.includes(size)) {
              return true;
            }

            return `Has to be one of ${validSizes.join(', ')}`;
          }
        }
      ]
    });
  }

  fetchExt (str) {
    return str.substring(str.length - 14, str.length - 8);
  }

  run (msg, args) {
    startTyping(msg);
    const ava = args.member.user.displayAvatarURL({size: args.size}),
      embed = new MessageEmbed(),
      ext = this.fetchExt(ava);

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setImage(ext.includes('gif') ? `${ava}&f=.gif` : ava)
      .setTitle(args.member.displayName)
      .setURL(ava)
      .setDescription(`[Direct Link](${ava})`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};