import { LengthUnit } from '@utils/Constants';
import { Argument } from 'klasa';

export default class CoinSideArgument extends Argument {
  run(arg: LengthUnit) {
    if (LengthUnit[arg]) return LengthUnit[arg];

    throw `Has to be one of ${Object.keys(LengthUnit).map(val => `\`${val}\``).join(', ')}`;
  }
}