import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { TemperatureUnit } from '../Constants';

export default class TemperatureUnitType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'temperature');
    }

    public validate (unit: TemperatureUnit) {
        if (TemperatureUnit[unit]) return true;

        return stripIndents`Has to be one of ${Object.keys(TemperatureUnit).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection or`;
    }

    public parse (unit: TemperatureUnit) {
        return TemperatureUnit[unit];
    }
}