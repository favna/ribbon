import { Argument, ArgumentType, CommandoClient, CommandoMessage } from 'awesome-commando';
import { stripIndents } from 'common-tags';
import { CoinSide } from '../constants';

export default class CoinSideType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'coinside');
    }

    public validate (side: CoinSide, msg: CommandoMessage, arg: Argument) {
        if (CoinSide[side]) return true;

        return stripIndents`Has to be one of ${Object.keys(CoinSide).map(val => `\`${val}\``).join(', ')}
                            Respond with your new selection oro`;
    }

    public parse (side: CoinSide) {
        return CoinSide[side];
    }
}