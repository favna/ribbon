import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { LengthUnits } from '../Constants';

export default class LengthUnitType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'length');
    }

    public validate (unit: LengthUnits, msg: CommandoMessage, arg: Argument) {
        if (LengthUnits[unit]) return true;

        return stripIndents`Has to be one of ${Object.keys(LengthUnits).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection or`;
    }

    public parse (unit: LengthUnits) {
        return LengthUnits[unit];
    }
}