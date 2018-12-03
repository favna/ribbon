/**
 * @file Pokémon FlavorCommand - Gets flavor text from a Pokémon
 *
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example
 *     `necrozmaduskmane` or `metagrossmega`. Due to message limit size it fetches as many entries possible starting
 *     with generation 7 going downwards. If you want to get the shiny sprite displayed add the `--shiny` at the end of
 *     the search
 *
 * **Aliases**: `flavors`, `dexdata`, `dexentries`, `dextext`, `dextex`, `dexter`, `flavour`, `flavours`
 * @module
 * @category pokemon
 * @name flavor
 * @example flavor dragonite
 * @param {StringResolvable} PokemonName The name of the pokemon you want to get flavor text for
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Fuse from 'fuse.js';
import * as moment from 'moment';
import {
    capitalizeFirstLetter,
    deleteCommandMessages,
    IPokeData,
    startTyping,
    stopTyping,
    zalgolize,
} from '../../components';
import { BattlePokedex, PokeAliases } from '../../data/dex';
import * as dexEntries from '../../data/dex/flavorText.json';

export default class FlavorCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'flavor',
            aliases: ['flavors', 'dexentries', 'dextext', 'dextex', 'flavour', 'flavours'],
            group: 'pokemon',
            memberName: 'flavor',
            description: 'Get all the available dex entries for a Pokémon',
            format: 'PokemonName',
            examples: ['flavor Dragonite'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'pokemon',
                    prompt: 'Get info from which Pokémon?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    /* tslint:disable:prefer-conditional-expression*/
    public run (msg: CommandoMessage, { pokemon, shines }: { pokemon: string, shines: boolean }) {
        try {
            startTyping(msg);
            if ((/(?:--shiny)/i).test(pokemon)) {
                pokemon = (pokemon.substring(0, pokemon.indexOf('--shiny')) + pokemon.substring(pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
                shines = true;
            }
            if (pokemon.split(' ')[0] === 'mega') {
                pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
            }

            const aliasoptions: Fuse.FuseOptions<any> = {
                shouldSort: true,
                keys: [{ name: 'alias', getfn: t => t.alias, weight: 1 }],
                location: 0,
                distance: 100,
                threshold: 0.2,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const pokeoptions: Fuse.FuseOptions<any> = {
                shouldSort: true,
                keys: [
                    { name: 'species', getfn: t => t.species, weight: 1 },
                    { name: 'num', getfn: t => t.num, weight: 0.6 }
                ],
                location: 0,
                distance: 100,
                threshold: 0.2,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const aliasFuse = new Fuse(PokeAliases, aliasoptions);
            const pokeFuse = new Fuse(BattlePokedex, pokeoptions);
            const firstSearch = pokeFuse.search(pokemon);
            const aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : null;
            const pokeSearch = !firstSearch.length && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch;
            const dataEmbed = new MessageEmbed();
            const poke = pokeSearch[0];
            const pokeData: IPokeData = {
                entries: [],
                sprite: '',
            };

            let totalEntriesLength = 0;

            if (poke.forme) {
                // @ts-ignore
                for (const entry of dexEntries[`${poke.num}${poke.forme.toLowerCase()}`]) {
                    pokeData.entries.push({
                        game: entry.version_id,
                        text: entry.flavor_text,
                    });
                }
            } else {
                // @ts-ignore
                for (const entry of dexEntries[poke.num]) {
                    pokeData.entries.push({
                        game: entry.version_id,
                        text: entry.flavor_text,
                    });
                }
            }

            if (!pokeData.entries.length) {
                pokeData.entries.push({
                    game: 'N.A.',
                    text: '*PokéDex data not found for this Pokémon*',
                });
            }
            let i = pokeData.entries.length - 1;

            outer: do {
                dataEmbed.addField(pokeData.entries[i].game, pokeData.entries[i].text, false);
                for (const field of dataEmbed.fields) {
                    totalEntriesLength += field.value.length;
                    if (totalEntriesLength >= 2000) {
                        break outer;
                    }
                }
                i -= 1;
            } while (i !== -1);

            if (poke.num < 0) {
                pokeData.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
            } else if (shines) {
                pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${poke.species.replace(/(%| )/g, '')
                    .toLowerCase()}.png`;
            } else {
                pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${poke.species.replace(/(%| )/g, '')
                    .toLowerCase()}.png`;
            }

            dataEmbed
                .setColor(this.fetchColor(poke.color))
                .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
                .setAuthor(`#${poke.num} - ${capitalizeFirstLetter(poke.species)}`, pokeData.sprite)
                .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase()
                    .replace(/(%| )/g, '')}.gif`)
                .setDescription('Dex entries throughout the games starting at the latest one. Possibly not listing all available due to 2000 characters limit.');

            if (poke.num === 0) {
                const fields = [];

                for (const field in dataEmbed.fields) {
                    fields.push({
                        inline: dataEmbed.fields[field].inline,
                        name: zalgolize(dataEmbed.fields[field].name),
                        value: zalgolize(dataEmbed.fields[field].value),
                    });
                }

                dataEmbed.description = zalgolize(dataEmbed.description);
                dataEmbed.author.name = zalgolize(dataEmbed.author.name);
                dataEmbed.fields = fields;
                dataEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
            }
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(dataEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            if ((/(?:Cannot read property 'forme' of undefined|Cannot read property 'length' of undefined)/i).test(err.toString())) {
                return msg.reply(stripIndents`no Pokémon or flavor texts found for \`${pokemon}\``);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`flavor\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${pokemon}
                **Shiny?:** ${shines ? 'yes' : 'no'}
                **Error Message:** ${err}
            `);

            return msg.reply(stripIndents`no Pokémon found for \`${pokemon}\`.
                If it was an error that occurred then I notified ${this.client.owners[0].username} about it
                and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
        }
    }

    private fetchColor (col: string) {
        switch (col) {
            case 'Black':
                return '#323232';
            case 'Blue':
                return '#257CFF';
            case 'Brown':
                return '#A3501A';
            case 'Gray':
                return '#969696';
            case 'Green':
                return '#3EFF4E';
            case 'Pink':
                return '#FF65A5';
            case 'Purple':
                return '#A63DE8';
            case 'Red':
                return '#FF3232';
            case 'White':
                return '#E1E1E1';
            case 'Yellow':
                return '#FFF359';
            default:
                return '#FF0000';
        }
    }
}