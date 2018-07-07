/**
 * @file Pokémon TypeCommand - Gets the type matchup of any 1 or 2 types  
 * **Aliases**: `matchup`, `weakness`, `advantage`
 * @module
 * @category pokémon
 * @name type
 * @example type dragon flying
 * @param {StringResolvable} Types One or two types to find the matchup for
 * @returns {MessageEmbed} All weaknesses, advantages
 */

const moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleTypeChart} = require(path.join(__dirname, '../../data/dex/typechart')),
  {oneLine, stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TypeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'type',
      memberName: 'type',
      group: 'pokemon',
      aliases: ['matchup', 'weakness', 'advantage'],
      description: 'Get type matchup for a given type or type combination',
      format: 'FirstType [SecondType]',
      examples: ['type Dragon Flying'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'types',
          prompt: 'Get info on which type(s)?',
          type: 'string',
          validate: (input) => {
            const validTypes = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water'];

            input = input.split(' ');
            if (input.every(type => validTypes.includes(type))) return true; // eslint-disable-line curly
            
            return `one of more of your types was invalid. Valid types are ${validTypes.map(val => `\`${val}\``).join(', ')}`;
          }
        }
      ]
    });
  }

  /* eslint-disable max-statements, complexity */
  run (msg, {types}) {
    try {
      startTyping(msg);
      const atkMulti = {
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
          Water: 1
        },
        atkNoRaw = [],
        atkNoTypes = [],
        atkNormalRaw = [],
        atkNormalTypes = [],
        atkResistRaw = [],
        atkResistTypes = [],
        atkVulnDisplay = [],
        atkVulnRaw = [],
        atkVulnTypes = [],
        defMulti = {
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
          Water: 1
        },
        displayTypes = [],
        noRaw = [],
        noTypes = [],
        normalRaw = [],
        normalTypes = [],
        resistRaw = [],
        resistTypes = [],
        typeEmbed = new MessageEmbed(),
        vulnDisplay = [],
        vulnRaw = [],
        vulnTypes = [];

      let atkNoCheck = false,
        atkNormalCheck = false,
        atkResistCheck = false,
        atkVulnCheck = false,
        noCheck = false,
        normalCheck = false,
        resistCheck = false,
        vulnCheck = false;

      for (let z = 0; z < types.split(' ').length; z += 1) {
        const argsSplit = types.split(' ')[z];

        if (Object.keys(BattleTypeChart).map(c => c.toLowerCase())
          .indexOf(argsSplit.toLowerCase()) !== -1) {

          const toType = capitalizeFirstLetter(argsSplit),
            dTaken = BattleTypeChart[toType].damageTaken; // eslint-disable-line sort-vars

          displayTypes.push(toType);

          for (const toMatch in dTaken) {
            if (defMulti[toMatch] && dTaken[toMatch] === 1) {
              defMulti[toMatch] *= 2;
            } else if (defMulti[toMatch] && dTaken[toMatch] === 2) {
              defMulti[toMatch] *= 0.5;
            } else if (defMulti[toMatch] && dTaken[toMatch] === 3) {
              defMulti[toMatch] = 0;
            }
          }

          for (const toMatch in BattleTypeChart) {
            if (atkMulti[toMatch]) {
              if (BattleTypeChart[toMatch].damageTaken[toType] === 1) {
                atkMulti[toMatch] *= 2;
              } else if (BattleTypeChart[toMatch].damageTaken[toType] === 2) {
                atkMulti[toMatch] *= 0.5;
              } else if (BattleTypeChart[toMatch].damageTaken[toType] === 3) {
                atkMulti[toMatch] *= 0;
              }
            }
          }
        }

        for (const def in defMulti) {
          if (defMulti[def] > 1) {
            vulnCheck = true;
          }
          if (defMulti[def] === 1) {
            normalCheck = true;
          }
          if (defMulti[def] > 0 && defMulti[def] < 1) {
            resistCheck = true;
          }
          if (defMulti[def] === 0) {
            noCheck = true;
          }
        }

        for (const atk in atkMulti) {
          if (atkMulti[atk] > 1) {
            atkVulnCheck = true;
          }
          if (atkMulti[atk] === 1) {
            atkNormalCheck = true;
          }
          if (atkMulti[atk] > 0 && atkMulti[atk] < 1) {
            atkResistCheck = true;
          }
          if (atkMulti[atk] === 0) {
            atkNoCheck = true;
          }
        }
      }

      for (const defense in defMulti) {
        if (vulnCheck && defMulti[defense] > 1 && vulnRaw.indexOf(defMulti[defense]) === -1) {
          vulnTypes.push(`${defense} (x${defMulti[defense]})`);
          vulnRaw.push(defMulti[defense]);
          vulnDisplay[0] = `Vulnerable to: ${vulnTypes.join(', ')}`;
        }

        if (normalCheck && defMulti[defense] === 1 && normalRaw.indexOf(defMulti[defense]) === -1) {
          normalTypes.push(defense);
          normalRaw.push(defense);

          vulnDisplay[1] = `Takes normal damage from: ${normalTypes.join(', ')}`;
        }

        if (resistCheck && defMulti[defense] > 0 && defMulti[defense] < 1 && resistRaw.indexOf(defMulti[defense]) === -1) {
          resistTypes.push(`${defense} (x${defMulti[defense]})`);
          resistRaw.push(defMulti[defense]);

          vulnDisplay[2] = `Resists: ${resistTypes.join(', ')}`;
        }

        if (noCheck && defMulti[defense] === 0 && noRaw.indexOf(defMulti[defense]) === -1) {
          noTypes.push(defense);
          noRaw.push(defense);
          vulnDisplay[3] = `Not affected by: ${noTypes.join(', ')}`;
        }
      }

      for (const attack in atkMulti) {
        if (atkVulnCheck && atkMulti[attack] > 1 && atkVulnRaw.indexOf(atkMulti[attack]) === -1) {
          atkVulnTypes.push(`${attack} (x${atkMulti[attack]})`);
          atkVulnRaw.push(atkMulti[attack]);
          atkVulnDisplay[0] = `Supereffective against: ${atkVulnTypes.join(', ')}`;
        }

        if (atkNormalCheck && atkMulti[attack] === 1 && atkNormalRaw.indexOf(atkMulti[attack]) === -1) {
          atkNormalTypes.push(attack);
          atkNormalRaw.push(attack);

          atkVulnDisplay[1] = `Deals normal damage to: ${atkNormalTypes.join(', ')}`;
        }

        if (atkResistCheck && atkMulti[attack] > 0 && atkMulti[attack] < 1 && atkResistRaw.indexOf(atkMulti[attack]) === -1) {
          atkResistTypes.push(`${attack} (x${atkMulti[attack]})`);
          atkResistRaw.push(atkMulti[attack]);

          atkVulnDisplay[2] = `Not very effective against: ${atkResistTypes.join(', ')}`;
        }

        if (atkNoCheck && atkMulti[attack] === 0 && atkNoRaw.indexOf(atkMulti[attack]) === -1) {
          atkNoTypes.push(attack);
          atkNoRaw.push(attack);
          atkVulnDisplay[3] = `Doesn't affect: ${atkNoTypes.join(', ')}`;
        }
      }

      typeEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .setAuthor(`Type effectiveness for ${displayTypes.join(', ')}`)
        .addField('Offense', atkVulnDisplay.join('\n\n'))
        .addField('Defense', vulnDisplay.join('\n\n'))
        .addField('External Resources', oneLine`
      [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/${types.split(' ')[0]}_(type\\))  
      |  [Smogon](http://www.smogon.com/dex/sm/types/${types.split(' ')[0]})
      |  [PokémonDB](http://pokemondb.net/type/${types.split(' ')[0]})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(typeEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
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
};