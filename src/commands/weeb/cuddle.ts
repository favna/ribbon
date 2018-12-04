/**
 * @file Weeb CuddleCommand - Cuuuuddlleeesss!! 💕!
 * @module
 * @category weeb
 * @name cuddle
 * @example cuddle Velvet
 * @param {GuildMemberResolvable} [MemberToCuddle] Name of the member you want to cuddle
 */

import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import {
    deleteCommandMessages,
    startTyping,
    stopTyping,
} from '../../components';

export default class CuddleCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'cuddle',
            group: 'weeb',
            memberName: 'cuddle',
            description: 'Cuuuuddlleeesss!! 💕!',
            format: '[MemberToCuddle]',
            examples: ['cuddle Velvet'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to cuddle?',
                    type: 'member',
                    default: '',
                },
            ],
        });
    }

    public async run(
        msg: CommandoMessage,
        { member }: { member: GuildMember }
    ) {
        try {
            startTyping(msg);

            const cuddleFetch = await fetch(
                'https://nekos.life/api/v2/img/cuddle'
            );
            const cuddleImg = await cuddleFetch.json();

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(
                {
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: member
                        ? `Awww ${msg.member.displayName} is giving ${
                              member.displayName
                          } cuddles 💕!`
                        : `${
                              msg.member.displayName
                          } you must feel alone... Have a 🐈`,
                    image: {
                        url: member
                            ? cuddleImg.url
                            : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif',
                    },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a cuddle image 💔');
        }
    }
}
