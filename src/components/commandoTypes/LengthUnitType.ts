import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { LengthUnit } from '../Constants';

export default class LengthUnitType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'length');
    }

    public validate (unit: LengthUnit) {
        if (LengthUnit[unit]) return true;

        return stripIndents`Has to be one of ${Object.keys(LengthUnit).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection or`;
    }

    public parse (unit: LengthUnit) {
        return LengthUnit[unit];
    }
}