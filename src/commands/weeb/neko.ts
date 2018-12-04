/**
 * @file Weeb NekoCommand - Get a random cute cat girl 😍!
 * **Aliases**: `catgirl`
 * @module
 * @category weeb
 * @name neko
 * @example neko
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import {
    deleteCommandMessages,
    startTyping,
    stopTyping,
} from '../../components';

export default class NekoCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'neko',
            aliases: ['catgirl'],
            group: 'weeb',
            memberName: 'neko',
            description: 'Get a random cute cat girl 😍',
            examples: ['neko'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public async run(msg: CommandoMessage) {
        try {
            startTyping(msg);

            const nekoFetch = await fetch('https://nekos.life/api/v2/img/neko');
            const nekoImg = await nekoFetch.json();

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(
                {
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: `Here is your cute cat girl ${
                        msg.member.displayName
                    } 😻!`,
                    image: { url: nekoImg.url },
                },
                `<:cat:498198858032218143> <@${
                    msg.author.id
                }> <:cat:498198858032218143>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a neko image 💔');
        }
    }
}
