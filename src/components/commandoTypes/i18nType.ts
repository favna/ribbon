/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentType, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { Language } from '../Constants';

export default class I18nType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'i18n');
  }

  public validate(lang: any) {
    // eslint-disable-next-line
    // @ts-ignore
    if (Language[lang.toUpperCase()]) return true;

    return stripIndents`
      Has to be one of ${Object.values(Language).map(val => `\`${val}\``).join(', ')}
      Respond with your new selection or`;
  }

  public parse(lang: any) {
    // eslint-disable-next-line
    // @ts-ignore
    return Language[lang.toUpperCase()];
  }
}