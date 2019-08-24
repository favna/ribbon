import { roundNumber } from '@components/Utils';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class CasinoArgument extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage) {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');
    const lowerLimit: number = msg.guildSettings.get('casinoLowerLimit') || 1;
    const upperLimit: number = msg.guildSettings.get('casinoUpperLimit') || 10000;
    const chips = roundNumber(parseInt(arg));

    if (chips >= lowerLimit && chips <= upperLimit) return chips;
    throw new Error(`Reply with a chips amount between ${lowerLimit} and ${upperLimit}. Example: \`${roundNumber((lowerLimit + upperLimit) / 2)}\``);
  }
}