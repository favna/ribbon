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

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, sentencecase } from '@components/Utils';
import BattleTypeChart from '@pokedex/typechart';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { PokeTypeDataType } from 'RibbonTypes';

interface TypeArgs {
  types: string[];
}

export default class TypeCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'type',
      aliases: [ 'matchup', 'weakness', 'advantage' ],
      group: 'pokemon',
      memberName: 'type',
      description: 'Get type matchup for a given type or type combination',
      format: 'FirstType [SecondType]',
      examples: [ 'type Dragon Flying' ],
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
          validate: (input: string) => {
            const types = input
              .split(' ')
              .filter(Boolean)
              .map((type: string) => sentencecase(type))
              .slice(0, 2);

            if (types.every(type => Object.keys(BattleTypeChart).includes(type))) {
              return true;
            }

            return oneLine`
              one of more of your types was invalid.
              Valid types are ${Object.keys(BattleTypeChart).map((val: string) => `\`${val}\``).join(', ')}
            `;
          },
          parse: (p: string) => p.split(' ').filter(Boolean).map((type: string) => sentencecase(type)).slice(0, 2),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { types }: TypeArgs) {
    try {
      const atk: PokeTypeDataType = {
        doubleEffectiveTypes: [],
        doubleResistedTypes: [],
        effectiveTypes: [],
        effectlessTypes: [],
        multi: {
          bug: 1,
          dark: 1,
          dragon: 1,
          electric: 1,
          fairy: 1,
          fighting: 1,
          fire: 1,
          flying: 1,
          ghost: 1,
          grass: 1,
          ground: 1,
          ice: 1,
          normal: 1,
          poison: 1,
          psychic: 1,
          rock: 1,
          steel: 1,
          water: 1,
        },
        normalTypes: [],
        resistedTypes: [],
      };
      const def: PokeTypeDataType = JSON.parse(JSON.stringify(atk));
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
        .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
        .setThumbnail(`${ASSET_BASE_PATH}/ribbon/rotomphone.png`)
        .setAuthor(`Type effectiveness for ${types.join(' ')}`)
        .addField('__Offensive__', stripIndents`
                    Supereffective against: ${atk.doubleEffectiveTypes
    .map((el: string) => `${el} (x4)`)
    .concat(atk.effectiveTypes.map((el: string) => `${el} (x2)`))
    .join(', ')}

                    Deals normal damage to: ${atk.normalTypes.join(', ')}

                    Not very effective against: ${atk.doubleResistedTypes
    .map((el: string) => `${el} (x0.25)`)
    .concat(atk.resistedTypes.map((el: string) => `${el} (x0.5)`))
    .join(', ')}

                    ${atk.effectlessTypes.length ? `Doesn't affect: ${atk.effectlessTypes.join(', ')}` : ''}
                `)
        .addField('__Defensive__',
          stripIndents`
                    Vulnerable to: ${def.doubleEffectiveTypes
    .map((el: string) => `${el} (x4)`)
    .concat(def.effectiveTypes.map((el: string) => `${el} (x2)`))
    .join(', ')}

                    Takes normal damage from: ${def.normalTypes.join(', ')}

                    Resists: ${def.doubleResistedTypes
    .map((el: string) => `${el} (x0.25)`)
    .concat(def.resistedTypes.map((el: string) => `${el} (x0.5)`))
    .join(', ')}

                    ${def.effectlessTypes.length ? `Not affected by: ${def.effectlessTypes.join(', ')}` : ''}
                `)
        .addField('External Resources', oneLine`
                    [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/${types[0]}_(type\\))
                    | [Serebii](https://www.serebii.net/pokedex-sm/${types[0].toLowerCase()}.shtml)
                    | [Smogon](http://www.smogon.com/dex/sm/types/${types[0]})
                    | [PokémonDB](http://pokemondb.net/type/${types[0]})
                `);

      deleteCommandMessages(msg, this.client);

      return msg.embed(embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`type\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** ${types}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
}