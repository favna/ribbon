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
 * Give someone a hug ❤!  
 * **Aliases**: `bearhug`, `embrace`
 * @module
 * @category games
 * @name hug
 * @example hug Pyrrha
 * @param {member} [MemberToHug] Name of the member you want to give a hug
 * @returns {MessageEmbed} The hug and a cute image ❤
 */

const commando = require('discord.js-commando'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class kaiCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'hug',
      'memberName': 'hug',
      'group': 'games',
      'aliases': ['bearhug', 'embrace'],
      'description': 'Give someone a hug ❤',
      'format': 'MemberToGiveAHug',
      'examples': ['hug Favna'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'member',
          'prompt': 'Who do you want to give a hug?',
          'type': 'member',
          'default': ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://media.tenor.com/images/42922e87b3ec288b11f59ba7f3cc6393/tenor.gif',
        'https://media.tenor.com/images/a89c78696eb8854c04904959e8ac5e0e/tenor.gif',
        'https://media.giphy.com/media/143v0Z4767T15e/giphy.gif',
        'https://78.media.tumblr.com/6f314e0bd0d08734a1f00b909a2ecf60/tumblr_nzbxxe39IM1ttmhcxo1_400.gif',
        'https://myanimelist.cdn-dena.com/s/common/uploaded_files/1461068547-d8d6dc7c2c74e02717c5decac5acd1c7.gif',
        'https://gifimage.net/wp-content/uploads/2017/06/anime-hug-gif-11.gif',
        'https://s-media-cache-ak0.pinimg.com/originals/87/b5/50/87b55088247f99d5766ef6179ecdcceb.gif',
        'https://media.giphy.com/media/xZshtXrSgsRHy/source.gif',
        'https://myanimelist.cdn-dena.com/s/common/uploaded_files/1460993069-9ac8eaae8cd4149af4510d0fed0796bf.gif',
        'https://media.giphy.com/media/3ZnBrkqoaI2hq/giphy.gif',
        'https://media.giphy.com/media/IcCydiEyLjO0w/giphy.gif',
        'https://gifimage.net/wp-content/uploads/2017/01/Anime-hug-GIF-Image-Download-20.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, args) {
    deleteCommandMessages(msg, this.client);
    msg.embed({
      'description': args.member !== ''
        ? `${args.member.displayName}! You were hugged by ${msg.member.displayName} 💖!`
        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
      'image': {'url': args.member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      'color': msg.guild ? msg.guild.me.displayColor : 10610610
    });
  }
};