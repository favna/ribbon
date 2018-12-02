/**
 * @file Automod ExcessiveEmojisCommand - Toggle the excessive emojis filter
 *
 * **Aliases**: `ef`, `emojifilter`, `spammedemojis`, `manyemojis`
 * @module
 * @category automod
 * @name excessiveemojis
 * @example excessiveemojis enable
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class ExcessiveEmojisCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'excessiveemojis',
            aliases: ['ef', 'emojifilter', 'spammedemojis', 'manyemojis'],
            group: 'automod',
            memberName: 'excessiveemojis',
            description: 'Toggle the excessive emojis filter',
            format: 'BooleanResolvable',
            examples: ['excessiveemojis enable'],
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
                    prompt: 'Enable or disable the Excessive Emojis filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                },
                {
                    key: 'threshold',
                    prompt: 'How many emojis are allowed in 1 message?',
                    type: 'integer',
                    default: 5,
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

    public run (msg: CommandoMessage, { option, threshold, minlength }: { option: boolean, threshold: number, minlength: number }) {
        startTyping(msg);

        const eeEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = {
            minlength,
            threshold,
            enabled: option,
        };

        msg.guild.settings.set('emojis', options);

        eeEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`**Action:** Excessive Emojis filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Threshold:** Messages that have at least ${threshold} emojis will be deleted` : ''}
      ${option ? `**Minimum length:** Messages of at least ${minlength} are checked for excessive emojis` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, eeEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(eeEmbed);
    }
}