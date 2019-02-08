/**
 * @file Pokémon AbilityCommand - Gets information on an ability in Pokémon
 *
 * **Aliases**: `abilities`, `abi`
 * @module
 * @category pokémon
 * @name ability
 * @example ability multiscale
 * @param {string} AbilityName The name of the ability you  want to find
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse from 'fuse.js';
import moment from 'moment';
import { ASSET_BASE_PATH, capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping, UnionPokeAlias } from '../../components';
import { AbilityAliases, BattleAbilities } from '../../data/dex';

export default class AbilityCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'ability',
            aliases: ['abilities', 'abi'],
            group: 'pokemon',
            memberName: 'ability',
            description: 'Get the info on a Pokémon ability',
            format: 'AbilityName',
            examples: ['ability Multiscale'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'ability',
                    prompt: 'Get info on which ability?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { ability }: { ability: string }) {
        try {
            startTyping(msg);
            const fsoptions: Fuse.FuseOptions<UnionPokeAlias> = {
                shouldSort: true,
                keys: [
                    { name: 'alias', getfn: t => t.alias, weight: 0.5 },
                    { name: 'ability', getfn: t => t.ability, weight: 1 },
                    { name: 'id', getfn: t => t.id, weight: 0.6 },
                    { name: 'name', getfn: t => t.name, weight: 1 }
                ],
                location: 0,
                distance: 100,
                threshold: 0.6,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const aliasFuse = new Fuse(AbilityAliases, fsoptions);
            const abilityFuse = new Fuse(BattleAbilities, fsoptions);
            const aliasSearch = aliasFuse.search(ability);
            const abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability);
            const abilityEmbed = new MessageEmbed();

            if (!abilitySearch.length) throw new Error('no_ability');

            abilityEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
                .setTitle(capitalizeFirstLetter(abilitySearch[0].name))
                .addField('Description', abilitySearch[0].desc ? abilitySearch[0].desc : abilitySearch[0].shortDesc)
                .addField('External Resource', oneLine`
                    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(abilitySearch[0].name.replace(/ /g, '_'))}_(Ability\\))
                    |  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilitySearch[0].name.toLowerCase().replace(/ /g, '_')})
                    |  [PokémonDB](http://pokemondb.net/ability/${abilitySearch[0].name.toLowerCase().replace(/ /g, '-')})
			    `);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(abilityEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            if (/(?:no_ability)/i.test(err.toString())) {
                return msg.reply(oneLine`
                    no ability found for \`${ability}\`.
                    Be sure it is an ability that has an effect in battles
                `);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`ability\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		        **Input:** ${ability}
                **Error Message:** ${err}
          `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
