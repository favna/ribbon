import { ArgumentType, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';

export default class ValidBooleanType extends ArgumentType {
  private readonly truthy: Set<string>;
  private readonly falsy: Set<string>;

  public constructor(client: CommandoClient) {
    super(client, 'validboolean');
    this.truthy = new Set([ 'true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+' ]);
    this.falsy = new Set([ 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-' ]);
  }

  public validate(value: string) {
    if (this.truthy.has(value.toLowerCase()) || this.falsy.has(value.toLowerCase())) return true;

    return stripIndents`
      Has to be one of ${[ ...this.truthy, ...this.falsy ].map(val => `\`${val}\``).join(', ')}
      Respond with your new selection or`;
  }

  public parse(value: string) {
    if (this.truthy.has(value.toLowerCase())) return true;
    if (this.falsy.has(value.toLowerCase())) return false;
    throw new RangeError('Unknown boolean value.');
  }
}