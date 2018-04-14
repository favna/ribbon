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
 * @file Moderation NewsCommand - Make an announcement to a channel named "announcements" or "news"  
 * **Aliases**: `news`
 * @module
 * @category moderation
 * @name announce
 * @example announce Pokemon Switch has released!
 * @param {string} Announcement The announcement you want to make
 * @returns {Message} Announcement you wrote in the announcement / news channel
 */

const commando = require('discord.js-commando'),
  {deleteCommandMessages} = require('../../util.js'),
  {stripIndents} = require('common-tags');

module.exports = class NewsCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'announce',
      'memberName': 'announce',
      'group': 'moderation',
      'aliases': ['news'],
      'description': 'Make an announcement in the news channel',
      'format': 'Announcement',
      'examples': ['announce John Appleseed reads the news'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'body',
          'prompt': 'What do you want me to announce?',
          'type': 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    if (msg.guild.channels.exists('name', 'announcements') || msg.guild.channels.exists('name', 'news')) {
      const newsChannel = msg.guild.channels.exists('name', 'announcements') ? msg.guild.channels.find('name', 'announcements') : msg.guild.channels.find('name', 'news');

      if (newsChannel.permissionsFor(msg.guild.me).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
        return msg.reply('I do not have permission to send messages to that channel. Better go and fix that!');
      }

      let announce = args.body;

      announce.slice(0, 4) !== 'http' ? announce = `${args.body.slice(0, 1).toUpperCase()}${args.body.slice(1)}` : null;
      msg.attachments.first() && msg.attachments.first().url ? announce += `\n${msg.attachments.first().url}` : null;

      deleteCommandMessages(msg, this.client);

      return newsChannel.send(announce);
    }
    deleteCommandMessages(msg, this.client);

    return msg.reply(stripIndents`To use the announce command you need a channel named \'news\' or \'announcements\'.
    Here is a backup of your message:
    \`\`\`
    ${args.body}
    \`\`\``);
  }
};