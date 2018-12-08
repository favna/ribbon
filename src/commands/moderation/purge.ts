/**
 * @file Moderation PurgeCommand - Quickly delete a certain amount of messages
 *
 * **Aliases**: `prune`, `delete`
 * @module
 * @category moderation
 * @name purge
 * @example purge 10
 * @param {number} MessageAmount The amount of messages to delete, between 1 and 99
 */

import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { startTyping, stopTyping } from '../../components';

export default class PurgeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'purge',
            aliases: ['prune', 'delete'],
            group: 'moderation',
            memberName: 'purge',
            description: 'Purge a certain amount of messages',
            format: 'AmountOfMessages',
            examples: ['purge 5'],
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages should I purge?',
                    type: 'integer',
                    max: 100,
                    min: 1,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { amount }: { amount: number }) {
        startTyping(msg);
        amount = amount === 100 ? 99 : amount;
        msg.channel.bulkDelete(amount + 1, true);

        const reply = (await msg.say(`\`Deleted ${amount} messages\``)) as Message;

        stopTyping(msg);

        return reply.delete({
            timeout: 1000,
            reason: 'Deleting own return message after purge',
        });
    }
}
