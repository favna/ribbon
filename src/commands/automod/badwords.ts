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
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
    deleteCommandMessages,
    modLogMessage,
    startTyping,
    stopTyping,
    validateBool,
} from '../../components';

export default class BadWordsCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'badwords',
            aliases: ['badwordsfilter', 'bwf', 'bwf'],
            group: 'automod',
            memberName: 'badwords',
            description: 'Toggle the bad words filter',
            format: 'BooleanResolvable',
            details:
                "Please note that when adding new words to your server's filter you overwrite all your currently set words!",
            examples: ['badwords enable'],
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
                    prompt: 'Enable or disable the bad words filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                },
                {
                    key: 'words',
                    prompt:
                        'What words to filter (split on every `,`, for example `fbomb,darn`)?',
                    type: 'string',
                    default: 'fuck',
                    validate: (val: string) => {
                        if (
                            /([\S ]*,[\S ]*)*/i.test(val) &&
                            val.split(',').length >= 1
                        ) {
                            return true;
                        }

                        return 'You need at least 1 word and the valid format is `word,word,word`, for example `fbomb,darn`';
                    },
                    parse: (words: string) => words.split(','),
                },
            ],
        });
    }

    public run(
        msg: CommandoMessage,
        { option, words }: { option: boolean; words: Array<string> }
    ) {
        startTyping(msg);
        const bwfEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = {
            words,
            enabled: option,
        };

        msg.guild.settings.set('badwords', options);
        bwfEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(
                stripIndents`**Action:** Bad words filter has been ${
                    option ? 'enabled' : 'disabled'
                }
      ${
          option
              ? `**Words:** Bad words have been set to ${words
                    .map((word: string) => `\`${word}\``)
                    .join(', ')}`
              : ''
      }
      ${
          !msg.guild.settings.get('automod', false)
              ? `**Notice:** Be sure to enable the general automod toggle with the \`${
                    msg.guild.commandPrefix
                }automod\` command!`
              : ''
      }`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true))
            modLogMessage(
                msg,
                msg.guild,
                modlogChannel,
                msg.guild.channels.get(modlogChannel) as TextChannel,
                bwfEmbed
            );

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(bwfEmbed);
    }
}
