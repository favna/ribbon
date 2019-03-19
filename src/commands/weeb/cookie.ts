/**
 * @file Weeb CookieCommand - Steal someone's 🍪 gnanahahahaha
 *
 * **Aliases**: `.biscuit`, `biscuit`
 * @module
 * @category weeb
 * @name biscuit
 * @param {MemberResolvable} [member] Optional: Member to steal a cookie from
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed } from 'awesome-djs';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

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
                    default: (msg: CommandoMessage) => msg.member,
                }
            ],
            patterns: [/^\.(?:biscuit)$/i],
        });
    }

    public run (msg: CommandoMessage, { member }: { member: GuildMember }) {
        if (msg.patternMatches && !this.verifyRmt(msg)) return null;

        startTyping(msg);
        const cookieEmbed = new MessageEmbed();
        const isNotSelf = member.id !== msg.member.id;

        cookieEmbed
            .setImage(this.fetchImage())
            .setColor(msg.guild ? msg.guild.me.displayColor : DEFAULT_EMBED_COLOR)
            .setDescription(isNotSelf ? `Gnanahahahaha eating your cookie <@${member.id}>` : 'You won\'t steal my cookie!!');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(cookieEmbed);
    }

    private fetchImage () {
        const images = [
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie01.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie02.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie03.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie04.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie05.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie06.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie07.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie08.gif`,
            `${ASSET_BASE_PATH}/ribbon/cookie/cookie09.gif`
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
