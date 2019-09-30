import { tierAliases } from '@pokedex/aliases';
import { ArgumentType, CommandoClient } from 'discord.js-commando';
import cheerio from 'cheerio';
import { stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import fetch from 'node-fetch';
import { table } from 'table';
import { tierAlias } from 'RibbonTypes';

interface Fuser {
  hasMatch: boolean;
  tier: string;
  alias: string;
}

export default class ShowdownTierType extends ArgumentType {
  public constructor(client: CommandoClient) {
    super(client, 'sdtier');
  }

  private static tablefier(array: string[], size: number): string {
    const chunkedArray: string[][] = [ [] ];

    do {
      chunkedArray.push(array.splice(0, size));
    } while (array.length > 0);

    chunkedArray.shift();
    if (chunkedArray[chunkedArray.length - 1].length < size) {
      const difference = size - chunkedArray[chunkedArray.length - 1].length;
      for (let part = 0; part < difference; part++) {
        chunkedArray[chunkedArray.length - 1].push('');
      }
    }

    return table(chunkedArray.map((inner: string[]) => inner.map((tier: string) => tier.toLowerCase())));
  }

  private static fuser(searchStr: string): Fuser {
    const fuseOptions: FuseOptions<tierAlias> = { keys: [ 'alias', 'tier' ] };
    const fuseTable = new Fuse(tierAliases, fuseOptions);
    const fuseSearch = fuseTable.search(searchStr);

    return {
      hasMatch: Boolean(fuseSearch.length),
      tier: fuseSearch.length ? fuseSearch[0].tier : '',
      alias: fuseSearch.length ? fuseSearch[0].alias : '',
    };
  }

  public async validate(value: string) {
    const fuseRes = ShowdownTierType.fuser(value);
    if (fuseRes.hasMatch) value = fuseRes.alias;

    const page = await fetch('https://pokemonshowdown.com/ladder');
    const text = await page.text();
    const $ = cheerio.load(text);
    const ladders = $('.laddernav').text().split('\n').map(entry => entry.replace(/ /gm, '').split('\t')).flat().filter(Boolean);
    const isValid = ladders.some((ladder: string) => ladder.toLowerCase() === value);

    if (isValid) return true;

    return stripIndents`
      __**Unknown tier, reply with one of the following**__
      \`\`\`
        ${ShowdownTierType.tablefier(ladders, 3)}
      \`\`\`
    `;
  }

  public parse(value: string): string {
    const fuseRes = ShowdownTierType.fuser(value);
    if (fuseRes.hasMatch) value = fuseRes.tier;

    return `gen7${value}`;
  }
}