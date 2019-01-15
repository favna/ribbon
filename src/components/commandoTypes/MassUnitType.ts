import { stripIndents } from 'common-tags';
import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MassUnits } from '../constants';

export default class MassUnitType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'mass');
    }

    public validate (unit: MassUnits, msg: CommandoMessage, arg: Argument) {
        if (MassUnits[unit]) return true;

        return stripIndents`Has to be one of ${Object.keys(MassUnits).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection or`;
    }

    public parse (unit: MassUnits) {
        return MassUnits[unit];
    }
}