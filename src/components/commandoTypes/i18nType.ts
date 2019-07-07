import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { Language } from '../Constants';

export default class I18nType extends ArgumentType {
  constructor (client: CommandoClient) {
    super(client, 'i18n');
  }

  public validate (lang: any) {
    if (Language[lang.toUpperCase()]) return true;

    return stripIndents`
      Has to be one of ${Object.values(Language).map(val => `\`${val}\``).join(', ')}
      Respond with your new selection or`;
  }

  public parse (lang: any) {
    return Language[lang.toUpperCase()];
  }
}