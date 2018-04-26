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
 * @file Owner DBPostCommand - Posts current guild count to discordbotlist  
 * @module
 * @category owner
 * @name dbpost
 * @returns {Message} Confirmation the update was made
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class DBPostCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dbpost',
      memberName: 'dbpost',
      group: 'owner',
      description: 'Post current server count to Discord Bots List',
      guildOnly: false,
      ownerOnly: true
    });
  }

  async run (msg) {
    startTyping(msg);
    const post = await request.post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
      .set('Authorization', process.env.discordbotskey)
      .send({server_count: this.client.guilds.size}); // eslint-disable-line camelcase

    if (post) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('updated discordbots.org stats.');
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred updating discordbots.org stats.');
  }
};