/**
 * @file Weeb PatCommand - Pat a good person 🐇!
 * @module
 * @category weeb
 * @name pat
 * @example pat Ruby
 * @param {GuildMemberResolvable} [MemberToPat] Name of the member you want to pat
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';

export default class PatCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'pat',
            group: 'weeb',
            memberName: 'pat',
            description: 'Pat a good person 🐇!',
            format: 'MemberToPat',
            examples: ['pat Favna'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to pat?',
                    type: 'member',
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            const patFetch = await fetch('https://nekos.life/api/v2/img/pat');
            const petImg = await patFetch.json();
            const isNotSelf = member.id !== msg.member!.id;

            deleteCommandMessages(msg, this.client);

            return msg.embed({
                    color: msg.guild ? msg.guild.me!.displayColor : 10610610,
                    description: isNotSelf
                        ? `${member.displayName}! You got patted by ${msg.member!.displayName} 🐇!`
                        : `${msg.member!.displayName} you must feel alone... Have a 🐈`,
                    image: { url: isNotSelf ? petImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
                },
                `<@${member ? member.id : msg.author!.id}>`
            );
        } catch (err) {
            return msg.reply('something went wrong getting a pat image 💔');
        }
    }
}
