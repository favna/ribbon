import { Currency } from '@utils/Constants';
import { stripIndents } from 'common-tags';
import { Argument } from 'klasa';

export default class CurrencyArgument extends Argument {
  run(arg: Currency) {
    if (Currency[arg]) return Currency[arg];

    throw stripIndents(
      `
        Has to be one of ${Object.keys(Currency).map(val => `\`${val}\``).join(', ')}
        For more details, see the list here: <https://docs.openexchangerates.org/docs/supported-currencies>
        Respond with your new selection or
      `
    );
  }
}