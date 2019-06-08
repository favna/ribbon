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
 * @param {string} PokemonName The name of the pokemon you want to get flavor text for
 */

import { ASSET_BASE_PATH, CollectorTimeout } from '@components/Constants';
import { FlavorJSONType, IPokeDexAliases, PokeDataType, PokedexType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import zalgo from '@favware/zalgo';
import { pokeAliases } from '@pokedex/aliases';
import entries from '@pokedex/flavorText.json';
import BattlePokedex from '@pokedex/pokedex';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';

type FlavorArgs = {
    pokemon: string;
    shines: boolean;
    hasManageMessages: boolean;
    position: number;
};

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

    // tslint:disable:prefer-conditional-expression
    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { pokemon, shines, hasManageMessages, position = 0 }: FlavorArgs) {
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
            const aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : null;
            const pokeSearch = !firstSearch.length && aliasSearch && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch;

            if (!pokeSearch.length) throw new Error('no_pokemon');

            let poke = pokeSearch[position];
            let pokeData = this.fetchAllData(poke, shines);
            let dataEmbed = this.prepMessage(pokeData, poke, shines, pokeSearch.length, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(dataEmbed) as CommandoMessage;

            if (pokeSearch.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                const reactionCollector = new ReactionCollector(
                    message, navigationReactionFilter, { time: CollectorTimeout.five }
                );

                reactionCollector.on('collect', (reaction: MessageReaction, user: User) => {
                    if (!this.client.userid.includes(user.id)) {
                        reaction.emoji.name === '➡' ? position++ : position--;
                        if (position >= pokeSearch.length) position = 0;
                        if (position < 0) position = pokeSearch.length - 1;
                        poke = pokeSearch[position];
                        pokeData = this.fetchAllData(poke, shines);
                        dataEmbed = this.prepMessage(pokeData, poke, shines, pokeSearch.length, position, hasManageMessages);
                        message.edit('', dataEmbed);
                        message.reactions.get(reaction.emoji.name)!.users.remove(user);
                    }
                });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            if (/(?:no_pokemon)/i.test(err.toString())) {
                return msg.reply(stripIndents`no Pokémon or flavor texts found for \`${pokemon}\``);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`flavor\` command!
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

    private fetchAllData (poke: PokedexType, shines: boolean): PokeDataType {
        const flavors: FlavorJSONType = entries as FlavorJSONType;
        const pokeData: PokeDataType = {
            sprite: '',
            entries: [],
        };

        if (poke.forme && flavors[`${poke.num}${poke.forme.toLowerCase()}`]) {
            for (const entry of flavors[`${poke.num}${poke.forme.toLowerCase()}`]) {
                pokeData.entries.push({
                    game: entry.version_id,
                    text: entry.flavor_text,
                });
            }
        } else {
            for (const entry of flavors[poke.num]) {
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

        if (poke.num < 0) {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/unknown.png`;
        } else if (shines) {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/shiny/${poke.species.replace(/([%. ])/g, '').toLowerCase()}.png`;
        } else {
            pokeData.sprite = `${ASSET_BASE_PATH}/ribbon/pokesprites/regular/${poke.species.replace(/([%. ])/g, '').toLowerCase()}.png`;
        }

        return pokeData;
    }

    private prepMessage (
        pokeData: PokeDataType, poke: PokedexType, shines: boolean, pokeSearchLength: number,
        position: number, hasManageMessages: boolean
    ): MessageEmbed {
        const dataEmbed = new MessageEmbed();

        let i = pokeData.entries.length - 1;
        let totalEntriesLength = 0;

        dataEmbed
            .setColor(FlavorCommand.fetchColor(poke.color))
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/rotomphone.png`)
            .setAuthor(`#${poke.num} - ${sentencecase(poke.species)}`, pokeData.sprite)
            .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase().replace(/([% ])/g, '')}.gif`)
            .setDescription('Dex entries throughout the games starting at the latest one. Possibly not listing all available due to 2000 characters limit.')
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${pokeSearchLength}` : '');

        outer: do {
            dataEmbed.addField(
                pokeData.entries[i].game,
                pokeData.entries[i].text,
                false
            );
            for (const field of dataEmbed.fields) {
                totalEntriesLength += field.value.length;
                if (totalEntriesLength >= 2000) {
                    break outer;
                }
            }
            i -= 1;
        } while (i !== -1);

        if (poke.num === 0) {
            const fields = [];

            for (const field in dataEmbed.fields) {
                fields.push({
                    inline: dataEmbed.fields[field].inline,
                    name: zalgo(dataEmbed.fields[field].name),
                    value: zalgo(dataEmbed.fields[field].value),
                });
            }

            dataEmbed.description = zalgo(dataEmbed.description);
            dataEmbed.author!.name = zalgo(dataEmbed.author!.name!);
            dataEmbed.fields = fields;
            dataEmbed.setImage(`${ASSET_BASE_PATH}/ribbon/missingno.png`);
        }

        return dataEmbed;
    }
}
