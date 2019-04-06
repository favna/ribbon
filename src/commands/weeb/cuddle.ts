/**
 * @file Weeb CuddleCommand - Cuuuuddlleeesss!! 💕!
 * @module
 * @category weeb
 * @name cuddle
 * @example cuddle Velvet
 * @param {GuildMemberResolvable} [MemberToCuddle] Name of the member you want to cuddle
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';

export default class CuddleCommand extends Command {
    constructor (client: CommandoClient) {
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
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const cuddleFetch = await fetch('https://nekos.life/api/v2/img/cuddle');
            const cuddleImg = await cuddleFetch.json();
            const isNotSelf = member.id !== msg.member.id;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(
                {
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: isNotSelf
                        ? `Awww ${msg.member.displayName} is giving ${member.displayName} cuddles 💕!`
                        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
                    image: { url: isNotSelf ? cuddleImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a cuddle image 💔');
        }
    }
}
