import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { validBooleansMap } from '../Constants';

export default class ValidBooleanType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'validboolean');
    }

    public validate (value: string) {
        if (validBooleansMap.includes(value)) return true;

        return stripIndents`
            Has to be one of ${validBooleansMap.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or
        `;
    }

    public parse (value: string) {
        return validBooleansMap.includes(value);
    }
}