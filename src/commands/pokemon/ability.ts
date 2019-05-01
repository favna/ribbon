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

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { IPokeAbilityAliases, PokeAbilityDetailsType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import BattleAbilities from '@pokedex/abilities';
import { abilityAliases } from '@pokedex/aliases';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';

type AbilityArgs = {
    ability: string;
    hasManageMessages: boolean;
    position: number;
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
    public async run (msg: CommandoMessage, { ability, hasManageMessages, position = 0 }: AbilityArgs) {
        try {
            const abilityOptions: FuseOptions<PokeAbilityDetailsType & IPokeAbilityAliases> = { keys: ['alias', 'ability', 'id', 'name'] };
            const aliasFuse = new Fuse(abilityAliases, abilityOptions);
            const abilityFuse = new Fuse(BattleAbilities, abilityOptions);
            const aliasSearch = aliasFuse.search(ability);
            const abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability);
            const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

            if (!abilitySearch.length) throw new Error('no_ability');

            let currentAbility = abilitySearch[position];
            let abilityEmbed = this.prepMessage(color, currentAbility, abilitySearch.length, position);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(abilityEmbed) as CommandoMessage;

            if (abilitySearch.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= abilitySearch.length) position = 0;
                            if (position < 0) position = abilitySearch.length - 1;
                            currentAbility = abilitySearch[position];
                            abilityEmbed = this.prepMessage(color, currentAbility, abilitySearch.length, position);
                            message.edit('', abilityEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
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

    private prepMessage (color: string, ability: PokeAbilityDetailsType, abilitySearchLength: number, position: number): MessageEmbed {
        return new MessageEmbed()
            .setColor(color)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
            .setTitle(sentencecase(ability.name))
            .setFooter(`Result ${position + 1} of ${abilitySearchLength}`)
            .addField('Description', ability.desc ? ability.desc : ability.shortDesc)
            .addField('External Resource', oneLine`
                   [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${sentencecase(ability.name.replace(/ /g, '_'))}_(Ability\\))
                |  [Smogon](http://www.smogon.com/dex/sm/abilities/${ability.name.toLowerCase().replace(/ /g, '_')})
                |  [PokémonDB](http://pokemondb.net/ability/${ability.name.toLowerCase().replace(/ /g, '-')})
        `);
    }
}
