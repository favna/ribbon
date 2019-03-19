/**
 * @file Weeb TickleCommand - TICKLE WAR 😂!!
 * @module
 * @category weeb
 * @name tickle
 * @example tickle Yang
 * @param {GuildMemberResolvable} [MemberToTickle] Name of the member you want to tickle
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';
import { ASSET_BASE_PATH, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class TickleCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'tickle',
            group: 'weeb',
            memberName: 'tickle',
            description: 'TICKLE WAR 😂!!',
            format: 'MemberToTickle',
            examples: ['tickle Yang'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to tickle?',
                    type: 'member',
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const tickleFetch = await fetch('https://nekos.life/api/v2/img/tickle');
            const tickleImg = await tickleFetch.json();
            const isNotSelf = member.id !== msg.member.id;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: isNotSelf
                        ? `${member.displayName}! You were tickled by ${msg.member.displayName}, tickle them back!!!`
                        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
                    image: { url: isNotSelf ? tickleImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a tickle image 💔');
        }
    }
}
