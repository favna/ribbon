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
 * @file Games KissCommand - Give someone a kiss ❤!  
 * @module
 * @category games
 * @name kiss
 * @example kiss Pyrrha
 * @param {member} [MemberToKiss] Name of the member you want to give a kiss
 * @returns {MessageEmbed} The kiss and a cute image ❤
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class KissCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kiss',
      memberName: 'kiss',
      group: 'games',
      description: 'Give someone a kiss ❤',
      format: 'MemberToGiveAKiss',
      examples: ['kiss Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a kiss?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/kiss/kiss01.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss02.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss03.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss04.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss05.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss06.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss07.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss08.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss09.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss10.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss11.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, args) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: args.member !== ''
        ? `${args.member.displayName}! You were kissed by ${msg.member.displayName} 💋!`
        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
      image: {url: args.member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};