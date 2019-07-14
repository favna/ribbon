import { ArgumentType, CommandoClient } from 'awesome-commando';
import { stripIndents } from 'common-tags';

export default class TcgPropsType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'tcgprops');
  }

  public validate(value: string): string | true {
    const props: string[] = value.split(' ').filter(Boolean);

    if (props.every((prop: string) => [ 'name', 'types', 'subtype', 'supertype', 'hp' ].includes(prop))) return true;

    return stripIndents`
      Has to be any combination of ${[ 'name', 'types', 'subtype', 'supertype', 'hp' ].map((val: string) => `\`${val}\``).join(', ')}
      Respond with your new selection or`;
  }

  public parse(value: string): string[] {
    return value.split(' ').filter(Boolean);
  }
}