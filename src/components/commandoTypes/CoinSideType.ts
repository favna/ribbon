import { ArgumentType, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { CoinSide } from '../Constants';

export default class CoinSideType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'coinside');
  }

  public validate(side: CoinSide) {
    if (CoinSide[side]) return true;

    return stripIndents`
      Has to be one of ${Object.keys(CoinSide).map(val => `\`${val}\``).join(', ')}
      Respond with your new selection oro`;
  }

  public parse(side: CoinSide) {
    return CoinSide[side];
  }
}