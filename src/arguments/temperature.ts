import { TemperatureUnit } from '@components/Constants';
import { Argument } from 'klasa';

export default class CoinSideArgument extends Argument {
  run(arg: TemperatureUnit) {
    if (TemperatureUnit[arg]) return TemperatureUnit[arg];

    throw new Error(`Has to be one of ${Object.keys(TemperatureUnit).map(val => `\`${val}\``).join(', ')}`);
  }
}