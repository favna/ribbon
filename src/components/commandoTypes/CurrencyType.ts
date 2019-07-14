import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { Currency } from '../Constants';

export default class CurrencyType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'currency');
  }

  public validate(unit: Currency) {
    if (Currency[unit]) return true;

    return stripIndents`
      Has to be one of ${Object.keys(Currency).map(val => `\`${val}\``).join(', ')}
      For more details, see the list here: <https://docs.openexchangerates.org/docs/supported-currencies>
      Respond with your new selection or`;
  }

  public parse(unit: Currency) {
    return Currency[unit].toLowerCase();
  }
}