/**
 * @file Moderation PurgeCommand - Quickly delete a certain amount of messages  
 * **Aliases**: `prune`, `delete`
 * @module
 * @category moderation
 * @name purge
 * @example purge 10
 * @param {Number} MessageAmount The amount of messages to delete, between 1 and 99
 * @returns {Message} Confirmation of the amount of messages deleted - will self delete after 1 second.
 */

import {Command} from 'discord.js-commando'; 
import {stopTyping, startTyping} from '../../components/util.js';

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
          max: 100,
          type: 'integer'
        }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {amount}) {
    startTyping(msg);
    amount = amount === 100 ? 99 : amount;
    msg.channel.bulkDelete(amount + 1, true);

    const reply = await msg.say(`\`Deleted ${amount + 1} messages\``);

    stopTyping(msg);

    return reply.delete({
      timeout: 1000,
      reason: 'Deleting own return message after purge'
    });
  }
};