/**
 * @file Weeb SlapCommand - Slap a dumb person 💢!
 * @module
 * @category weeb
 * @name slap
 * @example slap Cinder
 * @param {GuildMemberResolvable} [MemberToSlap] Name of the member you want to slap
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';

export default class SlapCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'slap',
            group: 'weeb',
            memberName: 'slap',
            description: 'Slap a dumb person 💢',
            format: 'MemberToSlap',
            examples: ['slap Cinder'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to slap?',
                    type: 'member',
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const slapFetch = await fetch('https://nekos.life/api/v2/img/slap');
            const slapImg = await slapFetch.json();
            const isNotSelf = member.id !== msg.member!.id;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me!.displayColor : 10610610,
                    description: isNotSelf
                        ? `${member.displayName}! You got slapped by ${msg.member!.displayName} 💢!`
                        : `${msg.member!.displayName} did you mean to slap someone B-Baka 🤔?`,
                    image: { url: isNotSelf ? slapImg.url : `${ASSET_BASE_PATH}/ribbon/baka.gif` },
                },
                `<@${member ? member.id : msg.author!.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a slap image 💔');
        }
    }
}
