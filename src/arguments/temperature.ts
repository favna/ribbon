import { TemperatureUnit } from '@utils/Constants';
import { Argument } from 'klasa';

export default class extends Argument {
  run(arg: TemperatureUnit) {
    if (TemperatureUnit[arg]) return TemperatureUnit[arg];

    throw `Has to be one of ${Object.keys(TemperatureUnit).map(val => `\`${val}\``).join(', ')}`;
  }
}