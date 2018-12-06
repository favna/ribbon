/**
 * @file Games DndCCommand - Flips a coin
 *
 * **Aliases**: `coinflip`, `dndc`, `dcoin`
 * @module
 * @category games
 * @name dndc
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class DndCCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'dndcoin',
            aliases: ['coinflip', 'dndc', 'dcoin'],
            group: 'games',
            memberName: 'dndcoin',
            description: 'Flips a coin',
            examples: ['coin'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage) {
        startTyping(msg);
        const coinEmbed = new MessageEmbed();
        const flip = roundNumber(Math.random());

        coinEmbed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setImage(
                flip === 1
                    ? 'https://favna.xyz/images/ribbonhost/dndheads.png'
                    : 'https://favna.xyz/images/ribbonhost/dndtails.png'
            )
            .setTitle(`Flipped ${flip === 1 ? 'heads' : 'tails'}`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(coinEmbed);
    }
}
