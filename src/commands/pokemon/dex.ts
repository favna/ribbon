/**
 * @file Pokémon DexCommand - Gets information about a Pokémon from Dexter.
 *
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example
 *     `necrozmaduskmane` or `metagrossmega`. If you want to get the shiny sprite displayed add the `--shiny` at the
 *     end of the search.
 *
 * **Aliases**: `p`, `mon`, `pokemon`, `pokedex`, `df`, `dexfind`, `dexdata`, `dexter`, `rotom`
 * @module
 * @category pokemon
 * @name dex
 * @example dex dragonite
 * @param {string} PokemonName The name of the pokemon you want to find
 */

import { ASSET_BASE_PATH, CollectorTimeout } from '@components/Constants';
import { FlavorJSONType, FormatsJSONType, IPokeDexAliases, PokeDataType, PokedexType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase, titlecase } from '@components/Utils';
import { pokeAliases } from '@pokedex/aliases';
import entries from '@pokedex/flavorText.json';
import formats from '@pokedex/formats.json';
import BattlePokedex from '@pokedex/pokedex';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import zalgo from 'awesome-zalgo';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';

type DexArgs = {
    pokemon: string;
    shines: boolean;
    hasManageMessages: boolean;
    position: number;
};

export default class DexCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'dex',
            aliases: ['p', 'mon', 'pokemon', 'pokedex', 'df', 'dexfind', 'dexdata', 'dexter', 'rotom'],
            group: 'pokemon',
            memberName: 'dex',
            description: 'Get the info on a Pokémon',
            format: 'PokemonName',
            examples: ['dex Dragonite'],
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

    private static fetchColor (col: string) {
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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { pokemon, shines, hasManageMessages, position = 0 }: DexArgs) {
        try {
            if (/(?:--shiny)/i.test(pokemon)) {
                pokemon = pokemon.substring(0, pokemon.indexOf('--shiny')) + pokemon.substring(pokemon.indexOf('--shiny') + '--shiny'.length).replace(/ /g, '');
                shines = true;
            }
            if (pokemon.split(' ')[0] === 'mega') {
                pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
            }

            const pokeoptions: FuseOptions<PokedexType & IPokeDexAliases> = {
                keys: ['alias', 'species', 'name', 'num'],
                threshold: 0.2,
            };
            const aliasFuse = new Fuse(pokeAliases, pokeoptions);
            const pokeFuse = new Fuse(BattlePokedex, pokeoptions);
            const firstSearch = pokeFuse.search(pokemon);
            const aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : [];
            const pokeSearch = !firstSearch.length && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch;

            if (!pokeSearch.length) throw new Error('no_pokemon');

            let poke = pokeSearch[position];
            let pokeData = this.fetchAllData(poke, shines, pokeFuse);
            let dexEmbed = this.prepMessage(pokeData, poke, shines, pokeSearch.length, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(dexEmbed) as CommandoMessage;

            if (pokeSearch.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= pokeSearch.length) position = 0;
                            if (position < 0) position = pokeSearch.length - 1;
                            poke = pokeSearch[position];
                            pokeData = this.fetchAllData(poke, shines, pokeFuse);
                            dexEmbed = this.prepMessage(pokeData, poke, shines, pokeSearch.length, position, hasManageMessages);
                            message.edit('', dexEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            if (/(?:no_pokemon)/i.test(err.toString())) return msg.reply(stripIndents`no Pokémon found for \`${pokemon}\``);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`dex\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${pokemon}
                **Shiny?:** ${shines ? 'yes' : 'no'}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private fetchAllData (
        poke: PokedexType, shines: boolean,
        pokeFuse: Fuse<PokedexType, Fuse.FuseOptions<PokedexType & IPokeDexAliases>>
    ): PokeDataType {
        const tiers: FormatsJSONType = formats as FormatsJSONType;
        const flavors: FlavorJSONType = entries as FlavorJSONType;

        const pokeData: PokeDataType = {
            abilities: '',
            evos: `**${sentencecase(poke.species)}**`,
            flavors: '*PokéDex data not found for this Pokémon*',
            genders: '',
            sprite: '',
            tier: tiers[poke.species.toLowerCase().replace(/([-% ])/gm, '')],
            entries: [],
        };

        if (poke.prevo) {
            pokeData.evos = oneLine`\`${sentencecase(poke.prevo)}\`
            ${pokeFuse.search(poke.prevo)[0].evoLevel
                    ? `(${pokeFuse.search(poke.prevo)[0].evoLevel})`
                    : ''} → ${pokeData.evos} **(${poke.evoLevel})**`;

            if (pokeFuse.search(poke.prevo).length) {
                const prevoSearch = pokeFuse.search(poke.prevo)[0].prevo;
                if (prevoSearch) pokeData.evos = `\`${sentencecase(prevoSearch)}\` → ${pokeData.evos}`;
            }
        }

        if (poke.evos) {
            pokeData.evos = oneLine`${pokeData.evos} → ${poke.evos
                .map((entry: string) => `\`${sentencecase(entry)}\` (${pokeFuse.search(entry)[0].evoLevel})`)
                .join(', ')} `;

            if (poke.evos.length === 1) {
                if (pokeFuse.search(poke.evos[0]).length && pokeFuse.search(poke.evos[0])[0].evos) {
                    const evosMap = pokeFuse.search(poke.evos[0])[0].evos;
                    if (evosMap && evosMap.length) {
                        pokeData.evos = oneLine`${pokeData.evos}
                        → ${evosMap.map((entry: string) =>
                            `\`${sentencecase(entry)}\` (${pokeFuse.search(entry)[0].evoLevel})`
                        ).join(', ')}`;
                    }
                }
            }
        }

        if (!poke.prevo && !poke.evos) pokeData.evos += ' (No Evolutions)';

        for (const ability in poke.abilities) {
            if (ability === '0') {
                pokeData.abilities += `${poke.abilities[ability]}`;
            } else if (ability === 'H') {
                pokeData.abilities += `, *${poke.abilities[ability]}*`;
            } else {
                pokeData.abilities += `, ${poke.abilities[ability]}`;
            }
        }

        switch (poke.gender) {
            case 'N':
                pokeData.genders = 'None';
                break;
            case 'M':
                pokeData.genders = '100% ♂';
                break;
            case 'F':
                pokeData.genders = '100% ♀';
                break;
            default:
                pokeData.genders = '50% ♂ | 50% ♀';
                break;
        }

        if (poke.genderRatio) {
            pokeData.genders = `${poke.genderRatio.M * 100}% ♂ | ${poke
                .genderRatio.F * 100}% ♀`;
        }

        // tslint:disable:prefer-conditional-expression
        if (poke.num >= 0) {
            if (poke.forme && flavors[`${poke.num}${poke.forme.toLowerCase()}`]) {
                pokeData.flavors = flavors[`${poke.num}${poke.forme.toLowerCase()}`][flavors[`${poke.num}${poke.forme.toLowerCase()}`].length - 1].flavor_text;
            } else {
                pokeData.flavors = flavors[poke.num][flavors[poke.num].length - 1].flavor_text;
            }
        }

        if (poke.num < 0) {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/unknown.png`;
        } else if (shines) {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/shiny/${poke.species.replace(/([%. ])/g, '').toLowerCase()}.png`;
        } else {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/regular/${poke.species.replace(/([%. ])/g, '').toLowerCase()}.png`;
        }
        // tslint:enable:prefer-conditional-expression

        return pokeData;
    }

    private prepMessage (
        pokeData: PokeDataType, poke: PokedexType, shines: boolean, pokeSearchLength: number,
        position: number, hasManageMessages: boolean
    ): MessageEmbed {
        const dexEmbed: MessageEmbed = new MessageEmbed();

        dexEmbed
            .setColor(DexCommand.fetchColor(poke.color))
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
            .setAuthor(`#${poke.num} - ${sentencecase(poke.species)}`, pokeData.sprite)
            .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase().replace(/([% ])/g, '')}.gif`)
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${pokeSearchLength}` : '')
            .addField('Type(s)', poke.types.join(', '), true)
            .addField('Abilities', pokeData.abilities, true)
            .addField('Gender Ratio', pokeData.genders, true)
            .addField('Smogon Tier', pokeData.tier ? pokeData.tier : 'Unknown/Alt form', true)
            .addField('Height', `${poke.heightm}m`, true)
            .addField('Weight', `${poke.weightkg}kg`, true)
            .addField('Egg Groups', poke.eggGroups ? poke.eggGroups.join(', ') : '', true);

        if (poke.otherFormes) dexEmbed.addField('Other Formes', poke.otherFormes.join(', '), true);

        dexEmbed
            .addField('Evolutionary Line', pokeData.evos, false)
            .addField('Base Stats',
                Object.keys(poke.baseStats)
                    .map(index => `${index.toUpperCase()}: **${poke.baseStats[index]}**`)
                    .join(', ')
            )
            .addField('PokéDex Data', pokeData.flavors)
            .addField('External Resource', oneLine`${poke.num >= 0 ? `
            [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${titlecase(poke.species).replace(/ /g, '_')}_(Pokémon\\))` : '*Fan made Pokémon*'}
             ${poke.num >= 1 ? `
                |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${poke.species.replace(/ /g, '_')})
                |  [PokémonDB](http://pokemondb.net/pokedex/${poke.species.replace(/ /g, '-')})` : ''}`
            );

        if (poke.num === 0) {
            const fields = [];

            for (const field in dexEmbed.fields) {
                fields.push({
                    inline: dexEmbed.fields[field].inline,
                    name: zalgo(dexEmbed.fields[field].name),
                    value: zalgo(dexEmbed.fields[field].value),
                });
            }

            dexEmbed.fields = fields;
            dexEmbed.author!.name = zalgo(dexEmbed.author!.name!);
            dexEmbed.setImage(`${ASSET_BASE_PATH}/ribbon/missingno.png`);
        }

        return dexEmbed;
    }
}