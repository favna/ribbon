import { roundNumber } from '@components/Utils';
import { Argument, KlasaMessage, Possible } from 'klasa';
import { GuildSettings } from '@root/RibbonTypes';
import { isNumber } from 'util';

export default class CasinoArgument extends Argument {
  run(arg: string, possible: Possible, msg: KlasaMessage) {
    if (!msg.guild) throw new Error('This command can only be used inside a server.');
    const lowerLimit = msg.guildSettings.get(GuildSettings.casinoLowerLimit) as GuildSettings.casino['lowerLimit'];
    const upperLimit = msg.guildSettings.get(GuildSettings.casinoUpperLimit) as GuildSettings.casino['upperLimit'];
    const chips = roundNumber(parseInt(arg));

    if (chips >= lowerLimit && chips <= upperLimit) return chips;
    if (isNumber(lowerLimit) && isNumber(upperLimit)) {
      throw new Error(
        `Reply with a chips amount between ${lowerLimit} and ${upperLimit}. Example: \`${roundNumber((lowerLimit + upperLimit) / 2)}\``
      );
    }

    throw new Error(
      `Something awefully bad happened, please contact ${msg.client.options.owners.map(owner => `<@${owner}>`).join(' or ')}`
    );
  }
}