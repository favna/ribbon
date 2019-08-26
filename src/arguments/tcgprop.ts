import { ApplyOptions } from '@components/Utils';
import { Argument, ArgumentOptions } from 'klasa';

@ApplyOptions<ArgumentOptions>({aliases: [ 'tcgp' ]})
export default class TcgPropArgument extends Argument {
  run(arg: string) {
    const props: string[] = arg.split(' ').filter(Boolean);

    if (props.every((prop: string) => [ 'name', 'types', 'subtype', 'supertype', 'hp' ].includes(prop))) {
      return arg.split(' ').filter(Boolean);
    }

    throw new Error(
      `Has to be any combination of ${[ 'name', 'types', 'subtype', 'supertype', 'hp' ].map((val: string) => `\`${val}\``).join(', ')}`
    );
  }
}