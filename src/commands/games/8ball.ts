/**
 * @file Games EightBallCommand - Rolls a magic 8 ball using your input
 *
 * **Aliases**: `eightball`
 * @module
 * @category games
 * @name 8ball
 * @example 8ball is Favna a genius coder?
 * @param {string} question Question you want the 8 ball to answer
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, eightBallPredictionsMap, roundNumber, startTyping, stopTyping } from '../../components';

export default class EightBallCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: '8ball',
            aliases: ['eightball'],
            group: 'games',
            memberName: '8ball',
            description: 'Roll a magic 8ball',
            format: 'YourQuestion',
            examples: ['8ball is Favna a genius coder?'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'question',
                    prompt: 'For what question should I roll a magic 8ball?',
                    type: 'string',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { question }: { question: string }) {
        startTyping(msg);
        const eightBallEmbed = new MessageEmbed();

        eightBallEmbed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : process.env.DEFAULT_EMBED_COLOR)
            .addField(':question: Question', question, false)
            .addField(
                ':8ball: 8ball',
                eightBallPredictionsMap[roundNumber(Math.random() * eightBallPredictionsMap.length)],
                false
            );

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(eightBallEmbed);
    }
}
