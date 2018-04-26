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
 * @file Games HugCommand - Give someone a hug ❤!  
 * **Aliases**: `bearhug`, `embrace`
 * @module
 * @category games
 * @name hug
 * @example hug Pyrrha
 * @param {member} [MemberToHug] Name of the member you want to give a hug
 * @returns {MessageEmbed} The hug and a cute image ❤
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class HugCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hug',
      memberName: 'hug',
      group: 'games',
      aliases: ['bearhug', 'embrace'],
      description: 'Give someone a hug ❤',
      format: 'MemberToGiveAHug',
      examples: ['hug Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a hug?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/hug/hug01.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug02.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug03.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug04.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug05.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug06.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug07.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug08.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug09.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug10.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug11.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug12.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, args) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: args.member !== ''
        ? `${args.member.displayName}! You were hugged by ${msg.member.displayName} 💖!`
        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
      image: {url: args.member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};