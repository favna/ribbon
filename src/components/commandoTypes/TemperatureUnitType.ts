import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { TemperatureUnits } from '../constants';

export default class TemperatureUnitType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'temperature');
    }

    public validate (unit: TemperatureUnits, msg: CommandoMessage, arg: Argument) {
        if (TemperatureUnits[unit]) return true;

        return stripIndents`Has to be one of ${Object.keys(TemperatureUnits).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection or`;
    }

    public parse (unit: TemperatureUnits) {
        return TemperatureUnits[unit];
    }
}