/**
 * @file Weeb CookieCommand - Steal someone's 🍪 gnanahahahaha
 *
 * **Aliases**: `.biscuit`, `biscuit`
 * @module
 * @category weeb
 * @name biscuit
 * @param {MemberResolvable} [member] Optional: Member to steal a cookie from
 */

import { GuildMember, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class CookieCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'cookie',
            aliases: ['biscuit'],
            group: 'weeb',
            memberName: 'cookie',
            description: 'Steal someone\'s 🍪 gnanahahahaha',
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Whose cookie to steal?',
                    type: 'member',
                    default: '',
                }
            ],
            patterns: [/^\.(?:biscuit)$/i],
        });
    }

    public run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        if (msg.patternMatches && !this.verifyRmt(msg)) return null;

        startTyping(msg);
        const cookieEmbed = new MessageEmbed();

        cookieEmbed
            .setImage(this.fetchImage())
            .setColor(msg.guild ? msg.guild.me.displayColor : '#7CFC00')
            .setDescription(member ? `Gnanahahahaha eating your cookie <@${member.id}>` : 'You won\'t steal my cookie!!');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(cookieEmbed);
    }

    private fetchImage () {
        const images = [
            'https://favna.xyz/images/ribbonhost/cookie/cookie01.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie02.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie03.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie04.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie05.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie06.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie07.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie08.gif',
            'https://favna.xyz/images/ribbonhost/cookie/cookie09.gif'
        ];
        const curImage = Math.floor(Math.random() * images.length);

        return images[curImage];
    }

    private verifyRmt (msg: CommandoMessage) {
        if (msg.guild.id === '373826006651240450') return true;
        if (msg.guild.commandPrefix === '.') return true;
        if (msg.guild.settings.get('regexmatches', false)) return true;
        return this.client.isOwner(msg.author);
    }
}
