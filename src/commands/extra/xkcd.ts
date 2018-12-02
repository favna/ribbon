/**
 * @file Extra XKCDCommand - Gets a random image from xkcd
 *
 * **Aliases**: `devjoke`, `comicjoke`
 * @module
 * @category extra
 * @name xkcd
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class XKCDCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'xkcd',
            aliases: ['devjoke', 'comicjoke'],
            group: 'extra',
            memberName: 'xkcd',
            description: 'Gets a random image from xkcd',
            examples: ['xkcd'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public async run (msg: CommandoMessage) {
        try {
            startTyping(msg);
            const count = await fetch('https://xkcd.com/info.0.json');
            const totalImages = await count.json();
            const randomNum = Math.floor(Math.random() * totalImages.num) + 1;
            const res = await fetch(`https://xkcd.com/${randomNum}/info.0.json`);
            const randomImage = await res.json();
            const xkcdEmbed = new MessageEmbed();

            xkcdEmbed
                .setTitle(randomImage.safe_title)
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setDescription(randomImage.alt)
                .setImage(randomImage.img)
                .setURL(`https://xkcd.com/${randomNum}/`);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            return msg.embed(xkcdEmbed);
        } catch (err) {
            stopTyping(msg);
            return msg.reply('woops, couldn\'t get a random xkcd image. Have a 🎀 instead!');
        }
    }
}