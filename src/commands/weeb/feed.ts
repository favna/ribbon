/**
 * @file Weeb FeedCommand - Feed someone licious food 🍜 😋!
 * @module
 * @category weeb
 * @name feed
 * @example feed Ren
 * @param {GuildMemberResolvable} [MemberToFeed] Name of the member you want to feed
 */

import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class FeedCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'feed',
            group: 'weeb',
            memberName: 'feed',
            description: 'Feed someone licious food 🍜 😋!',
            format: 'MemberToFeed',
            examples: ['feed Ren'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to feed?',
                    type: 'member',
                    default: '',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const feedFetch = await fetch('https://nekos.life/api/v2/img/feed');
            const feedImg = await feedFetch.json();
            if (member.id === msg.member.id) member = null;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(
                {
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: member
                        ? `${member.displayName}! You were fed by ${msg.member.displayName} 🍜 😋!`
                        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
                    image: { url: member ? feedImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif' },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a feed image 💔');
        }
    }
}
