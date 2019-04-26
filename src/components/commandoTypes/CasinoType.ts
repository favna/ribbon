import { ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';
import { roundNumber } from '../Utils';

export default class CasinoType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'casino');
    }

    public validate (value: string, msg: CommandoMessage) {
        const lowerLimit = msg.guild.settings.get('casinoLowerLimit', 1);
        const upperLimit = msg.guild.settings.get('casinoUpperLimit', 10000);
        const chips = Number(value);

        if (chips >= lowerLimit && chips <= upperLimit) return true;
        return `Reply with a chips amount between ${lowerLimit} and ${upperLimit}. Example: \`${roundNumber((lowerLimit + upperLimit) / 2)}\``;
    }

    public parse (value: string) {
        return roundNumber(Number(value));
    }
}