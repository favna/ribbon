/**
 * @file Weeb SmugCommand - You're better than them
 * @module
 * @category weeb
 * @name smug
 * @example smug McDonalds
 * @param {GuildMemberResolvable} [MemberToHug] Name of the member you want to give a hug
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';

export default class SmugCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'smug',
            group: 'weeb',
            memberName: 'smug',
            description: 'You\'re better than them',
            format: 'MemberToSmugAt',
            examples: ['hug McDonalds'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'You\'re better than who?',
                    type: 'member',
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const hugFetch = await fetch('https://nekos.life/api/v2/img/smug');
            const hugImg = await hugFetch.json();
            const isNotSelf = member.id !== msg.member!.id;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me!.displayColor : 10610610,
                    description: isNotSelf
                        ? `Hahahahaha <:smug:532309525051736064>!`
                        : `${msg.member!.displayName} you must feel alone... Let Wendy's support your smugness`,
                    image: { url: isNotSelf ? hugImg.url : `${ASSET_BASE_PATH}/ribbon/smugwendy.gif` },
                },
                `<@${member ? member.id : msg.author!.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a hug image 💔');
        }
    }
}
