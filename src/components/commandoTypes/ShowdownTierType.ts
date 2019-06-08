import { tierAliases } from '@pokedex/aliases';
import { ArgumentType, CommandoClient } from 'awesome-commando';
import cheerio from 'cheerio';
import { stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import fetch from 'node-fetch';
import { table } from 'table';
import { IPokeTierAliases } from '../../RibbonTypes';

export default class ShowdownTierType extends ArgumentType {
    constructor (client: CommandoClient) {
        super(client, 'sdtier');
    }

    private static tablefier (array: string[], size: number): string {
        const chunkedArray: string[][] = [[]];

        do {
            chunkedArray.push(array.splice(0, size));
        } while (array.length > 0);

        chunkedArray.shift();
        if (chunkedArray[chunkedArray.length - 1].length < size) {
            const difference = size - chunkedArray[chunkedArray.length - 1].length;
            for (let i = 0; i < difference; i++) {
                chunkedArray[chunkedArray.length - 1].push('');
            }
        }
        return table(chunkedArray.map((inner: string[]) => inner.map((tier: string) => tier.toLowerCase())));
    }

    private static fuser (searchStr: string): { hasMatch: boolean, value: string } {
        const fuseOptions: FuseOptions<IPokeTierAliases> = { keys: ['alias'] };
        const fuseTable = new Fuse(tierAliases, fuseOptions);
        const fuseSearch = fuseTable.search(searchStr);

        return { hasMatch: !!fuseSearch.length, value: fuseSearch.length ? fuseSearch[0].tier : '' };
    }

    public async validate (value: string) {
        const fuseRes = ShowdownTierType.fuser(value);
        if (fuseRes.hasMatch) value = fuseRes.value;

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

    public parse (value: string): string {
        const fuseRes = ShowdownTierType.fuser(value);
        if (fuseRes.hasMatch) value = fuseRes.value;

        return `gen7${value}`;
    }
}