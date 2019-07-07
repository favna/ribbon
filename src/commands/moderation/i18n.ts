/**
 * @file Moderation I18nCommand - Sets the guild language
 *
 * This affects various parts of the responses of the bot, primarily the help prompts.
 * Any data returned from external sources is not translated.
 *
 *
 * Current supported languages are 'en' for English and 'nl' for Dutch
 *
 * **Aliases**: `language`, `lang`, `lng`
 * @module
 * @category moderation
 * @name i18n
 * @example i18n en
 * @example i18n nl
 * @param {en|nl} Language The new language to set
 */

import { Language } from '@components/Constants';
import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type I18nArgs = {
  language: Language;
};

export default class I18nCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'i18n',
      aliases: ['language', 'lang', 'lng'],
      group: 'moderation',
      memberName: 'i18n',
      description: 'Sets the guild language',
      format: 'boolean',
      details: stripIndents`
                This affects various parts of the responses of the bot, primarily the help prompts.
                Any data returned from external sources is not translated.

                Current supported languages are 'en' for English and 'nl' for Dutch
              `,
      examples: ['i18n en', 'i18n nl'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'language',
          prompt: 'What language should I set for this guild?',
          type: 'i18n',
          oneOf: Object.values(Language),
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public run (msg: CommandoMessage, { language }: I18nArgs) {
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const i18nEmbed = new MessageEmbed();

    msg.guild.settings.set('i18n', language);

    i18nEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(`**Action:** Guild language set to \`${this.languageMapper(language)}\``)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, i18nEmbed);
    }

    deleteCommandMessages(msg, this.client);

    return msg.embed(i18nEmbed);
  }

  private languageMapper (lang: Language) {
    switch (lang) {
      case Language.NL:
        return 'Nederlands';
      default:
        return 'English';
    }
  }
}
