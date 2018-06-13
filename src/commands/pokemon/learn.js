/**
 * @file Pokemon LearnCommand - Displays how a Pokemon can learn given moves, if at all  
 * Moves split on every `,`. See examples for usages.  
 * You can specify a generation for the match as third argument, in this case make sure to wrap the moves in `' '` if they have spaces!  
 * **Aliases**: `learnset`, `learnall`
 * @module
 * @category pokemon
 * @name learn
 * @example learn dragonite dragon dance
 * @example learn dragonite dragon dance,dragon claw
 * @param {StringResolvable} PokemonName Name of the pokemon to get the match for
 * @param {StringResolvable} [MoveName] Name of the move you want to find out about
 * @param {StringResolvable} [AnotherMoveName] Any additional moves you also want to find out about
 * @param {StringResolvable} [Generation] The generation to find the match for
 * @returns {MessageEmbed} Info on whether the Pokemon can learn the move and how or not
 */

const moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleLearnsets} = require(path.join(__dirname, '../../data/dex/learnsets')),
  {oneLine, stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class LearnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'learn',
      memberName: 'learn',
      group: 'pokemon',
      aliases: ['learnset', 'learnall'],
      description: 'Displays how a Pokemon can learn given moves, if at all',
      details: stripIndents`Moves split on every \`,\`. See examples for usages.
      You can specify a generation for the match as third argument, in this case make sure to wrap the moves in \`' '\` if they have spaces!`,
      format: 'PokemonName MoveName[, AnotherMoveName...] [Generation]',
      examples: ['learn dragonite dragon dance', 'learn dragonite dragon dance,dragon claw'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'pokemon',
          prompt: 'For which Pokemon should I check move learnability?',
          type: 'string',
          validate: (v) => {
            if (v in BattleLearnsets) {
              return true;
            }

            return `\`${v}\` is not a (supported) pokemon, please provide a pokemon name`;
          },
          parse: p => p.toLowerCase()
        },
        {
          key: 'moves',
          prompt: 'Which move(s) should I check for that Pokemon?',
          type: 'string',
          parse: (p) => {
            p.toLowerCase();
            if (p.includes(',')) {
              return p.split(',');
            }

            return [p];
          }
        },
        {
          key: 'gen',
          prompt: 'For which generation should move learnability be checked?',
          type: 'integer',
          default: 7,
          validate: (v) => {
            if (v >= 1 && v <= 7) {
              return true;
            }

            return 'has to be a number between 1 and 7 (including boundaries)';
          }
        }
      ]
    });
  }

  run (msg, {pokemon, moves, gen}) {
    try {
      startTyping(msg);

      const {learnset} = BattleLearnsets[pokemon],
        learnEmbed = new MessageEmbed(),
        methods = [],
        response = [];

      moves.forEach((move) => {
        if (move in learnset) {
          learnset[move].forEach((learn) => {
            if (learn.charAt(0) === gen.toString()) {
              methods.push(learn);
            }
          });

          methods.forEach((method) => {
            switch (method.slice(1, 2)) { // eslint-disable-line default-case
            case 'L':
              response.push(`${pokemon} **__can__** learn ${move} by level up at level ${method.slice(2)}`);
              break;
            case 'V':
              response.push(`${pokemon} **__can__** learn ${move} through virtual console transfer`);
              break;
            case 'T':
              response.push(`${pokemon} **__can__** learn ${move} through transferring from a previous generation`);
              break;
            case 'M':
              response.push(`${pokemon} **__can__** learn ${move} through TM`);
              break;
            case 'E':
              response.push(`${pokemon} **__can__** learn ${move} as Egg Move`);
              break;
            case 'S':
              response.push(`${pokemon} **__can__** learn ${move}, but it is Event Exclusive`);
              break;
            case 'D':
              response.push(`${pokemon} **__can__** learn ${move} through Dream World`);
              break;
            }
          });
          methods.length = 0;
        } else {
          response.push(`${pokemon} **__cannot__** learn ${move}`);
        }
      });

      learnEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .setAuthor(`${capitalizeFirstLetter(pokemon)}`, `https://favna.xyz/images/ribbonhost/pokesprites/regular/${pokemon.toLowerCase().replace(/ /g, '')}.png`)
        .setDescription(response.join('\n'));

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(learnEmbed);
    } catch (err) {
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`learn\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Pokemon:** ${pokemon}
      **Moves:** ${moves}
      **Gen:** ${gen}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};