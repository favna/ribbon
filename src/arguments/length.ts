import { LengthUnit } from '@components/Constants';
import { Argument } from 'klasa';

export default class CoinSideArgument extends Argument {
  run(arg: LengthUnit) {
    if (LengthUnit[arg]) return LengthUnit[arg];

    throw new Error(`Has to be one of ${Object.keys(LengthUnit).map(val => `\`${val}\``).join(', ')}`);
  }
}