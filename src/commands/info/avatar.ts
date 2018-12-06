/**
 * @file Games AvatarCommand - Get the avatar from any member on this server
 *
 * **Aliases**: `ava`
 * @module
 * @category info
 * @name avatar
 * @example avatar Favna
 * @param {GuildMemberResolvable} MemberName Member to get the avatar from
 * @param {GuildMemberResolvable} [ImageSize] Optional: Size of the avatar to get. Defaults to 1024
 */

import { stripIndents } from 'common-tags';
import { GuildMember, ImageSize, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class AvatarCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'avatar',
            aliases: ['ava'],
            group: 'info',
            memberName: 'avatar',
            description: 'Gets the avatar from a user',
            format: 'MemberID|MemberName(partial or full) [ImageSize]',
            examples: ['avatar Favna 2048'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'What user would you like to get the avatar from?',
                    type: 'member',
                },
                {
                    key: 'size',
                    prompt: 'What size do you want the avatar to be? (Valid sizes: 128, 256, 512, 1024, 2048)',
                    type: 'integer',
                    default: 1024,
                    validate: (size: string) => {
                        const validSizes = ['128', '256', '512', '1024', '2048'];

                        if (validSizes.includes(String(size))) {
                            return true;
                        }

                        return stripIndents`Has to be one of ${validSizes
                            .map(val => `\`${val}\``)
                            .join(', ')}
                            Respond with your new selection or`;
                    },
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, size }: { member: GuildMember; size?: ImageSize }) {
        startTyping(msg);
        const ava = member.user.displayAvatarURL({ size });
        const embed = new MessageEmbed();
        const ext = this.fetchExt(ava);

        embed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setImage(ext.includes('gif') ? `${ava}&f=.gif` : ava)
            .setTitle(member.displayName)
            .setURL(ava)
            .setDescription(`[Direct Link](${ava})`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
    }

    private fetchExt (str: string) {
        return str.substring(str.length - 14, str.length - 8);
    }
}
