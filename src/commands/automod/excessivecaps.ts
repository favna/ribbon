/**
 * @file Automod ExcessiveCapsCommand - Toggle the excessive caps filter
 *
 * **Aliases**: `spammedcaps`, `manycaps`, `caps`
 * @module
 * @category automod
 * @name excessivecaps
 * @example excessivecaps enable
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class ExcessiveCapsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'excessivecaps',
            aliases: ['spammedcaps', 'manycaps', 'caps'],
            group: 'automod',
            memberName: 'excessivecaps',
            description: 'Toggle the excessive caps filter',
            format: 'BooleanResolvable',
            examples: ['excessivecaps enable'],
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable the Excessive Caps filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                },
                {
                    key: 'threshold',
                    prompt: 'After how much percent of caps should a message be deleted?',
                    type: 'string',
                    default: '60',
                    validate: (t: string) => {
                        if (/(?:[%])/.test(t)) {
                            if (Number(t.slice(0, -1))) {
                                return true;
                            }
                        } else if (Number(t)) {
                            return true;
                        }

                        return 'has to be a valid percentile number in the format of `60% or `60`';
                    },
                    parse: (t: string) => /(?:[%])/.test(t) ? Number(t.slice(0, -1)) : Number(t),
                },
                {
                    key: 'minlength',
                    prompt: 'What should the minimum length of a message be before it is checked?',
                    type: 'integer',
                    default: 10,
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { option, threshold, minlength }: { option: boolean; threshold: number; minlength: number }) {
        startTyping(msg);
        const ecfEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = { minlength, threshold, enabled: option };

        msg.guild.settings.set('caps', options);

        ecfEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Excessive Caps filter has been ${option ? 'enabled' : 'disabled'}
                ${option ? `**Threshold:** Messages that have at least ${threshold}% caps will be deleted` : ''}
                ${option ? `**Minimum length:** Messages of at least ${minlength} are checked for caps` : ''}
                ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, ecfEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(ecfEmbed);
    }
}
