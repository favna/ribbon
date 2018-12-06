/**
 * @file Weeb PokeCommand - Poke an annoying person 👉!
 * @module
 * @category weeb
 * @name poke
 * @example poke Weiss
 * @param {GuildMemberResolvable} [MemberToPoke] Name of the member you want to poke
 */

import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class PokeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'poke',
            group: 'weeb',
            memberName: 'poke',
            description: 'Poke an annoying person 👉!',
            format: 'MemberToPoke',
            examples: ['poke Weiss'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to poke?',
                    type: 'member',
                    default: '',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        try {
            startTyping(msg);

            const pokeFetch = await fetch('https://nekos.life/api/v2/img/poke');
            const pokeImg = await pokeFetch.json();
            if (member.id === msg.member.id) member = null;

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed({
                    color: msg.guild ? msg.guild.me.displayColor : 10610610,
                    description: member
                        ? `${member.displayName}! You got poked by ${msg.member.displayName} 👉!`
                        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
                    image: { url: member ? pokeImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif' },
                },
                `<@${member ? member.id : msg.author.id}>`
            );
        } catch (err) {
            stopTyping(msg);

            return msg.reply('something went wrong getting a poke image 💔');
        }
    }
}
