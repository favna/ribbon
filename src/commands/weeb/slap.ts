/**
 * @file Weeb SlapCommand - Slap a dumb person 💢!
 * @module
 * @category weeb
 * @name slap
 * @example slap Cinder
 * @param {GuildMemberResolvable} [MemberToSlap] Name of the member you want to slap
 */

import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { ASSET_BASE_PATH, deleteCommandMessages, startTyping, stopTyping } from '../../components';

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
                    default: '',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const slapFetch = await fetch('https://nekos.life/api/v2/img/slap');
            const slapImg = await slapFetch.json();
            if (member.id === msg.member.id) member = null;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: member
                        ? `${member.displayName}! You got slapped by ${msg.member.displayName} 💢!`
                        : `${msg.member.displayName} did you mean to slap someone B-Baka 🤔?`,
                    image: { url: member ? slapImg.url : `${ASSET_BASE_PATH}/ribbon/baka.gif` },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a slap image 💔');
        }
    }
}
