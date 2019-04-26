/**
 * @file Automod BadWordsCommand - Toggle the bad words filter
 *
 * Please note that when adding new words to your server's filter you overwrite all your currently set words!
 *
 * **Aliases**: `badwordsfilter`, `bwf`, `bwf`
 * @module
 * @category automod
 * @name badwords
 * @example badwords enable
 * @param {boolean} Option True or False
 * @param {string} [words] Optional: comma separated list of words to filter
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class BadWordsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'badwords',
            aliases: ['badwordsfilter', 'bwf', 'bwf'],
            group: 'automod',
            memberName: 'badwords',
            description: 'Toggle the bad words filter',
            format: 'boolean',
            details: 'Please note that when adding new words to your server\'s filter you overwrite all your currently set words!',
            examples: ['badwords enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable the bad words filter?',
                    type: 'validboolean',
                },
                {
                    key: 'words',
                    prompt: 'What words to filter (split on every `,`, for example `fbomb,darn`)?',
                    type: 'stringarray',
                    default: ['fuck'],
                }
            ],
        });
    }

    @shouldHavePermission('MANAGE_MESSAGES', true)
    public run (msg: CommandoMessage, { option, words }: { option: boolean; words: string[] }) {
        startTyping(msg);
        const bwfEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = { words, enabled: option };

        msg.guild.settings.set('badwords', options);
        bwfEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Bad words filter has been ${option ? 'enabled' : 'disabled'}
                ${option ? `**Words:** Bad words have been set to ${words.map((word: string) => `\`${word}\``).join(', ')}` : ''}
                ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, bwfEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(bwfEmbed);
    }
}
