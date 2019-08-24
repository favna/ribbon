import { Argument, KlasaClient, ArgumentStore, ArgumentOptions } from 'klasa';

export default class TcgPropArgument extends Argument {
  constructor(client: KlasaClient, store: ArgumentStore, file: string[], directory: string, options?: ArgumentOptions) {
    super(client, store, file, directory, { ...options, aliases: [ 'tcgp' ] });
  }

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