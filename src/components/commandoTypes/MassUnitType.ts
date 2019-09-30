import { ArgumentType, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { MassUnit } from '../Constants';

export default class MassUnitType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'mass');
  }

  public validate(unit: MassUnit) {
    if (MassUnit[unit]) return true;

    return stripIndents`
      Has to be one of ${Object.keys(MassUnit).map(val => `\`${val}\``).join(', ')}
      Respond with your new selection or`;
  }

  public parse(unit: MassUnit) {
    return MassUnit[unit];
  }
}