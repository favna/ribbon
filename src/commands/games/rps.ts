/**
 * @file Games RockPaperScissorCommand - Play Rock Paper Scissors against random.org randomization
 *
 * **Aliases**: `rockpaperscissors`
 * @module
 * @category games
 * @name rps
 * @example rps Rock
 * @param {string} HandToPlay The hand that you want to play
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class RockPaperScissorCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'rps',
            aliases: ['rockpaperscissors'],
            group: 'games',
            memberName: 'rps',
            description: 'Play Rock Paper Scissors against random.org randomization',
            format: 'HandToPlay',
            examples: ['rps Rock'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'hand',
                    prompt: 'Do you play rock, paper or scissors?',
                    type: 'string',
                    validate: (v: string) => /(rock|paper|scissors)/i.test(v)
                        ? true
                        : 'has to be one of `rock`, `paper` or `scissors`',
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { hand }: { hand: string }) {
        try {
            startTyping(msg);

            const randPost = await fetch(
                'https://api.random.org/json-rpc/1/invoke',
                {
                    body: JSON.stringify({
                        id: Math.floor(Math.random() * 42),
                        jsonrpc: '2.0',
                        method: 'generateIntegers',
                        params: {
                            apiKey: process.env.RANDOM_ORG_API_KEY,
                            max: 3,
                            min: 1,
                            n: 1,
                        },
                    }),
                    headers: { 'Content-Type': 'application/json-rpc' },
                    method: 'POST',
                }
            );
            const random = await randPost.json();
            const randoms = random.result.random.data[0];
            const rpsEmbed = new MessageEmbed();

            let resString = 'Woops something went wrong';

            if (hand === 'rock' && randoms === 1) resString = 'It\'s a draw 😶! Both picked 🗿';
            else if (hand === 'rock' && randoms === 2) resString = 'I won 😃! My 📜 covered your 🗿';
            else if (hand === 'rock' && randoms === 3) resString = ' I lost 😞! Your 🗿 smashed my ✂ to pieces';
            else if (hand === 'paper' && randoms === 1) resString = 'I lost 😞! Your 📜 covered my 🗿';
            else if (hand === 'paper' && randoms === 2) resString = 'It\'s a draw 😶! Both picked 📜';
            else if (hand === 'paper' && randoms === 3) resString = 'I won 😃! My ✂️ cut your 📜 to shreds';
            else if (hand === 'scissor' && randoms === 1) resString = 'I won 😃! My 🗿 smashed your ✂ to pieces';
            else if (hand === 'scissor' && randoms === 2) resString = 'I lost 😞! Your ✂️ cut my 📜 to shreds';
            else if (hand === 'scissor' && randoms === 3) resString = 'It\'s a draw 😶! Both picked ✂';

            rpsEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setTitle('Rock Paper Scissors')
                .setDescription(resString);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(rpsEmbed);
        } catch (err) {
            stopTyping(msg);

            return msg.reply('an error occurred getting a random result and I\'m not going to rig this game.');
        }
    }
}
