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

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { IPokeAbilityAliases, PokeAbilityDetailsType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, sentencecase } from '@components/Utils';
import BattleAbilities from '@pokedex/abilities';
import { abilityAliases } from '@pokedex/aliases';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';

type AbilityArgs = {
    ability: string;
    hasManageMessages: boolean;
};

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

    @clientHasManageMessages()
    public run (msg: CommandoMessage, { ability, hasManageMessages }: AbilityArgs) {
        try {
            const fsoptions: FuseOptions<PokeAbilityDetailsType & IPokeAbilityAliases> = { keys: ['alias', 'ability', 'id', 'name'] };
            const aliasFuse = new Fuse(abilityAliases, fsoptions);
            const abilityFuse = new Fuse(BattleAbilities, fsoptions);
            const aliasSearch = aliasFuse.search(ability);
            const abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability);
            const abilityEmbed = new MessageEmbed();

            if (!abilitySearch.length) throw new Error('no_ability');

            abilityEmbed
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
                .setTitle(sentencecase(abilitySearch[0].name))
                .addField('Description', abilitySearch[0].desc ? abilitySearch[0].desc : abilitySearch[0].shortDesc)
                .addField('External Resource', oneLine`
                    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${sentencecase(abilitySearch[0].name.replace(/ /g, '_'))}_(Ability\\))
                    |  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilitySearch[0].name.toLowerCase().replace(/ /g, '_')})
                    |  [PokémonDB](http://pokemondb.net/ability/${abilitySearch[0].name.toLowerCase().replace(/ /g, '-')})
			    `);

            deleteCommandMessages(msg, this.client);

            return msg.embed(abilityEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            if (/(?:no_ability)/i.test(err.toString())) {
                return msg.reply(oneLine`
                    no ability found for \`${ability}\`.
                    Be sure it is an ability that has an effect in battles
                `);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`ability\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		        **Input:** ${ability}
                **Error Message:** ${err}
          `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
