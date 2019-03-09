/**
 * @file Weeb HugCommand - Give someone a hug ❤!
 * @module
 * @category weeb
 * @name hug
 * @example hug Nora
 * @param {GuildMemberResolvable} [MemberToHug] Name of the member you want to give a hug
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';
import { ASSET_BASE_PATH, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class HugCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'hug',
            group: 'weeb',
            memberName: 'hug',
            description: 'Give someone a hug ❤',
            format: 'MemberToGiveAHug',
            examples: ['hug Nora'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to give a hug?',
                    type: 'member',
                    default: '',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const hugFetch = await fetch('https://nekos.life/api/v2/img/hug');
            const hugImg = await hugFetch.json();
            const isMemberGiven = member.id === msg.member.id;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: isMemberGiven
                        ? `${member.displayName}! You were hugged by ${msg.member.displayName} 💖!`
                        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
                    image: { url: member ? hugImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a hug image 💔');
        }
    }
}
