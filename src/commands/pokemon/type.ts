/**
 * @file Pokémon TypeCommand - Gets the type matchup of any 1 or 2 types
 *
 * **Aliases**: `matchup`, `weakness`, `advantage`
 * @module
 * @category pokémon
 * @name type
 * @example type dragon flying
 * @param {string} Types One or two types to find the matchup for
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import { ASSET_BASE_PATH, capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';
import { BattleTypeChart } from '../../data/dex';

export default class TypeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'type',
            aliases: ['matchup', 'weakness', 'advantage'],
            group: 'pokemon',
            memberName: 'type',
            description: 'Get type matchup for a given type or type combination',
            format: 'FirstType [SecondType]',
            examples: ['type Dragon Flying'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'types',
                    prompt: 'Get info on which type(s)?',
                    type: 'string',
                    validate: (input: any) => {
                        input = input
                            .split(' ')
                            .map((type: string) => capitalizeFirstLetter(type))
                            .slice(0, 2) as string[];

                        if (input.every((type: any) => Object.keys(BattleTypeChart).includes(type))) {
                            return true;
                        }

                        return `one of more of your types was invalid. Valid types are ${Object.keys(BattleTypeChart).map(val => `\`${val}\``).join(', ')}`;
                    },
                    parse: (p: string) => p.split(' ').map((type: string) => capitalizeFirstLetter(type)).slice(0, 2),
                }
            ],
        });
    }

    /* tslint:disable: cyclomatic-complexity*/
    public run (msg: CommandoMessage, { types }: { types: string[] }) {
        try {
            startTyping(msg);
            const atk: any = {
                doubleEffectiveTypes: [],
                doubleResistedTypes: [],
                effectiveTypes: [],
                effectlessTypes: [],
                multi: {
                    Bug: 1,
                    Dark: 1,
                    Dragon: 1,
                    Electric: 1,
                    Fairy: 1,
                    Fighting: 1,
                    Fire: 1,
                    Flying: 1,
                    Ghost: 1,
                    Grass: 1,
                    Ground: 1,
                    Ice: 1,
                    Normal: 1,
                    Poison: 1,
                    Psychic: 1,
                    Rock: 1,
                    Steel: 1,
                    Water: 1,
                },
                normalTypes: [],
                resistedTypes: [],
            };
            const def = JSON.parse(JSON.stringify(atk));
            const embed = new MessageEmbed();

            for (const type of types) {
                const dDealt = BattleTypeChart[type].damageDealt;
                const dTaken = BattleTypeChart[type].damageTaken;

                for (const multiplier in dTaken) {
                    switch (dTaken[multiplier]) {
                        case 1:
                            def.multi[multiplier] *= 2;
                            break;
                        case 2:
                            def.multi[multiplier] *= 0.5;
                            break;
                        case 3:
                            def.multi[multiplier] = 0;
                            break;
                        default:
                            break;
                    }
                }

                for (const multiplier in dDealt) {
                    switch (dDealt[multiplier]) {
                        case 1:
                            atk.multi[multiplier] *= 2;
                            break;
                        case 2:
                            atk.multi[multiplier] *= 0.5;
                            break;
                        case 3:
                            atk.multi[multiplier] = 0;
                            break;
                        default:
                            break;
                    }
                }
            }

            for (const attack in def.multi) {
                switch (atk.multi[attack]) {
                    case 0:
                        atk.effectlessTypes.push(attack);
                        break;
                    case 0.25:
                        atk.doubleResistedTypes.push(attack);
                        break;
                    case 0.5:
                        atk.resistedTypes.push(attack);
                        break;
                    case 1:
                        atk.normalTypes.push(attack);
                        break;
                    case 2:
                        atk.effectiveTypes.push(attack);
                        break;
                    case 4:
                        atk.doubleEffectiveTypes.push(attack);
                        break;
                    default:
                        break;
                }
            }

            for (const defense in def.multi) {
                switch (def.multi[defense]) {
                    case 0:
                        def.effectlessTypes.push(defense);
                        break;
                    case 0.25:
                        def.doubleResistedTypes.push(defense);
                        break;
                    case 0.5:
                        def.resistedTypes.push(defense);
                        break;
                    case 1:
                        def.normalTypes.push(defense);
                        break;
                    case 2:
                        def.effectiveTypes.push(defense);
                        break;
                    case 4:
                        def.doubleEffectiveTypes.push(defense);
                        break;
                    default:
                        break;
                }
            }

            embed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
                .setAuthor(`Type effectiveness for ${types.join(' ')}`)
                .addField('__Offensive__', stripIndents`
                    Supereffective against: ${atk.doubleEffectiveTypes.map((el: string) => `${el} (x4)`).concat(atk.effectiveTypes.map((el: string) => `${el} (x2)`)).join(', ')}

                    Deals normal damage to: ${atk.normalTypes.join(', ')}

                    Not very effective against: ${atk.doubleResistedTypes.map((el: string) => `${el} (x0.25)`).concat(atk.resistedTypes.map((el: string) => `${el} (x0.5)`)).join(', ')}

                    ${atk.effectlessTypes.length ? `Doesn't affect: ${atk.effectlessTypes.join(', ')}` : ''}
                `
                )
                .addField(
                    '__Defensive__',
                    stripIndents`
                    Vulnerable to: ${def.doubleEffectiveTypes.map((el: string) => `${el} (x4)`).concat(def.effectiveTypes.map((el: string) => `${el} (x2)`)).join(', ')}

                    Takes normal damage from: ${def.normalTypes.join(', ')}

                    Resists: ${def.doubleResistedTypes.map((el: string) => `${el} (x0.25)`).concat(def.resistedTypes.map((el: string) => `${el} (x0.5)`)).join(', ')}

                    ${def.effectlessTypes.length ? `Not affected by: ${def.effectlessTypes.join(', ')}` : ''}
                `)
                .addField('External Resources', oneLine`
                    [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/${types[0]}_(type\\))
                    | [Serebii](https://www.serebii.net/pokedex-sm/${types[0].toLowerCase()}.shtml)
                    | [Smogon](http://www.smogon.com/dex/sm/types/${types[0]})
                    | [PokémonDB](http://pokemondb.net/type/${types[0]})
                `);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(embed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`type\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${types}
                **Error Message:** ${err}
            `);

            return msg.reply(stripIndents`An error occurred matching those types and I notified ${this.client.owners[0].username} about it.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
        }
    }
}
