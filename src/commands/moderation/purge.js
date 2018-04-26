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
 * @file Moderation PurgeCommand - Quickly delete a certain amount of messages  
 * **Aliases**: `prune`, `delete`
 * @module
 * @category moderation
 * @name purge
 * @example purge 10
 * @param {number} MessageAmount The amount of messages to delete, between 1 and 99
 * @returns {Message} Confirmation of the amount of messages deleted - will self delete after 1 second.
 */

const {Command} = require('discord.js-commando'), 
  {stopTyping, startTyping} = require('../../util.js');

module.exports = class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      memberName: 'purge',
      group: 'moderation',
      aliases: ['prune', 'delete'],
      description: 'Purge a certain amount of messages',
      format: 'AmountOfMessages',
      examples: ['purge 5'],
      guildOnly: true,
      args: [
        {
          key: 'amount',
          prompt: 'How many messages should I purge?',
          min: 1,
          max: 99,
          type: 'integer'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  async run (msg, args) {
    startTyping(msg);
    if (!msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES')) {
      stopTyping(msg);

      return msg.reply('I do not have permission to delete messages from this channel. Better go and fix that!');
    }

    msg.channel.bulkDelete(args.amount + 1, true);

    const reply = await msg.say(`\`Deleted ${args.amount} messages\``);

    stopTyping(msg);

    return reply.delete({
      timeout: 1000,
      reason: 'Deleting own return message after purge'
    });
  }
};