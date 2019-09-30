import { ArgumentType, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { roundNumber } from '../Utils';

export default class CasinoType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'casino');
  }

  public validate(value: string, msg: CommandoMessage) {
    const lowerLimit: number = msg.guild.settings.get('casinoLowerLimit', 1);
    const upperLimit: number = msg.guild.settings.get('casinoUpperLimit', 10000);
    const chips = Number(value);

    if (chips >= lowerLimit && chips <= upperLimit) return true;

    return `Reply with a chips amount between ${lowerLimit} and ${upperLimit}. Example: \`${roundNumber((lowerLimit + upperLimit) / 2)}\``;
  }

  public parse(value: string) {
    return roundNumber(Number(value));
  }
}