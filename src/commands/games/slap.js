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
 * @file Games SlapCommand - Slap a dumb person💢!  
 * **Aliases**: `bakaslap`
 * @module
 * @category games
 * @name slap
 * @example slap Cinder
 * @param {member} [MemberToSlap] Name of the member you want to slap
 * @returns {MessageEmbed} The slap and an image
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class SlapCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slap',
      memberName: 'slap',
      group: 'games',
      aliases: ['bakaslap'],
      description: 'Give someone a slap 💢',
      format: 'MemberToGiveASlap',
      examples: ['slap Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a slap?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/slap/slap01.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap02.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap03.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap04.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap05.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap06.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap07.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap08.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap09.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap10.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap11.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap12.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, args) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: args.member !== ''
        ? `${args.member.displayName}! You got slapped by ${msg.member.displayName} 💢!`
        : `${msg.member.displayName} did you mean to slap someone B-Baka 🤔?`,
      image: {url: args.member !== '' ? this.fetchImage() : 'http://cdn.awwni.me/mz98.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};