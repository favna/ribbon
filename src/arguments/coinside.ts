import { CoinSide } from '@components/Constants';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class CoinSideArgument extends Argument {
  run(arg: CoinSide, possible: Possible, msg: KlasaMessage) {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');

    if (CoinSide[arg]) return CoinSide[arg];

    throw new Error(`Has to be one of ${Object.keys(CoinSide).map(val => `\`${val}\``).join(', ')}`);
  }
}