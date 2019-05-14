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

import { deleteCommandMessages, logModMessage, resolveGuildI18n, shouldHavePermission } from '@components/Utils';
import i18n from '@i18n/i18n';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type BadWordsArgs = {
    shouldEnable: boolean;
    words: string[];
    language: string;
};

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
                    key: 'shouldEnable',
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
    @resolveGuildI18n()
    public run (msg: CommandoMessage, { shouldEnable, words, language }: BadWordsArgs) {
        const bwfEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = { words, enabled: shouldEnable };

        msg.guild.settings.set('badwords', options);
        bwfEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                ${this.getAction(this, language).replace('OPTION', this.getActiveState(this, language, shouldEnable ? 'enabled' : 'disabled'))}
                ${shouldEnable ? this.getWords(this, language).replace('WORDS', words.map((word: string) => `\`${word}\``).join(', ')) : ''}
                ${!msg.guild.settings.get('automod', false) ? this.getNotice(this, language).replace('PREFIX', msg.guild.commandPrefix) : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, bwfEmbed);
        }

        deleteCommandMessages(msg, this.client);

        return msg.embed(bwfEmbed);
    }

    private getAction (command: Command, language: string): string {
        return i18n.t(`commands.${command.groupID}.${command.memberName}.action`, { lng: language });
    }

    private getWords (command: Command, language: string): string {
        return i18n.t(`commands.${command.groupID}.${command.memberName}.words`, { lng: language });
    }

    private getNotice (command: Command, language: string): string {
        return i18n.t(`commands.${command.groupID}.${command.memberName}.notice`, { lng: language });
    }

    private getActiveState (command: Command, language: string, state: 'enabled' | 'disabled'): string {
        return i18n.t(`general.${state}`, { lng: language });
    }
}
