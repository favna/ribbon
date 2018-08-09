/**
 * @file Leaderboards OverwatchCommand - Shows Player Stats for a given BattleNet BattleTag  
 * **Aliases**: `owstats`
 * @module
 * @category leaderboards
 * @name overwatch
 * @example overwatch Camoflouge#1267
 * @param {StringResolvable} BattleTag BattleTag for that overwatch player
 * @returns {MessageEmbed} Stats of the player
 */

const duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  fetch = require('node-fetch'),
  moment = require('moment'),
  ms = require('ms'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class OverwatchCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'overwatch',
      memberName: 'overwatch',
      group: 'leaderboards',
      aliases: ['owstats'],
      description: 'Shows Player Stats for a given Overwatch player',
      format: 'BattleTag',
      examples: ['overwatch Camoflouge#1267'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'player',
          prompt: 'Respond with the player\'s BattleTag',
          type: 'string',
          validate: (tag) => {
            if ((/[a-zA-Z0-9]+((?:#|-)[0-9]{4,5}){0,1}/i).test(tag)) {
              return true;
            }

            return 'Has to be in the format of <name>#<identifier>, for example `cats#11481`';
          },
          parse: tag => tag.replace(/#/g, '-')
        },
        {
          key: 'platform',
          prompt: 'Respond with the platform that player plays on',
          type: 'string',
          validate: (plat) => {
            if ((/(?:pc|psn|xbl)/i).test(plat)) {
              return true;
            }

            return 'Has to be `pc`, `psn` or `xbl` for PC, Playstation or Xbox respectively';
          },
          parse: plat => plat.toLowerCase(),
          default: 'pc'
        },
        {
          key: 'region',
          prompt: 'Respond with the region that player is playing in',
          type: 'string',
          validate: (reg) => {
            if ((/(?:us|eu|asia)/).test(reg)) {
              return true;
            }

            return 'Has to be `us`, `eu` or `asia` for USA, Europe or Asia respectively';
          },
          parse: reg => reg.toLowerCase(),
          default: 'us'
        }
      ]
    });
  }

  async run (msg, {player, platform, region}) {
    try {
      startTyping(msg);
      const owData = await fetch(`https://ow-api.com/v1/stats/${platform}/${region}/${player}/complete`, {headers: {'Content-Type': 'application/json'}}),
        owEmbed = new MessageEmbed(),
        data = await owData.json();

      if (data.error) throw new Error('noplayer');
      if (!data.competitiveStats.topHeroes) throw new Error('nostats');
      if (!data.quickPlayStats.topHeroes) throw new Error('nostats');

      const topCompetitiveHeroes = Object.keys(data.competitiveStats.topHeroes).map(r => ({ // eslint-disable-line one-var
          hero: r,
          time: ms(data.competitiveStats.topHeroes[r].timePlayed)
        }))
          .sort((a, b) => a.time > b.time)
          .reverse(),
        topQuickPlayHeroes = Object.keys(data.quickPlayStats.topHeroes).map(r => ({
          hero: r,
          time: ms(data.quickPlayStats.topHeroes[r].timePlayed)
        }))
          .sort((a, b) => a.time > b.time)
          .reverse();

      owEmbed
        .setAuthor('Overwatch Player Statistics', 'https://favna.xyz/images/ribbonhost/overwatch.png')
        .setURL(`https://playoverwatch.com/en-us/career/${platform}/${player}`)
        .setThumbnail(data.icon)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Account Stats', stripIndents`
          Level: **${data.level}**
          Prestige level: **${data.level + (data.prestige * 100)}**
          Rank: **${data.rating ? data.rating : 'Unknown Rating'}${data.ratingName ? ` (${data.ratingName})` : null}**
          Total Games Won: **${data.gamesWon ? data.gamesWon : 'No games won'}**
          `, true)
        .addBlankField(true)
        .addField('Quickplay Stats', stripIndents`
          Final Blows: **${data.quickPlayStats.careerStats.allHeroes.combat.finalBlows}**
          Deaths: **${data.quickPlayStats.careerStats.allHeroes.combat.deaths}**
          Damage Dealt: **${data.quickPlayStats.careerStats.allHeroes.combat.damageDone}**
          Healing: **${data.quickPlayStats.careerStats.allHeroes.assists.healingDone}**
          Objective Kills: **${data.quickPlayStats.careerStats.allHeroes.combat.objectiveKills}**
          Solo Kills: **${data.quickPlayStats.careerStats.allHeroes.combat.soloKills}**
          Playtime: **${data.quickPlayStats.careerStats.allHeroes.game.timePlayed}**
          Games Won: **${data.quickPlayStats.games.won}**
          Golden Medals: **${data.quickPlayStats.awards.medalsGold}**
          Silver Medals: **${data.quickPlayStats.awards.medalsSilver}**
          Bronze Medals: **${data.quickPlayStats.awards.medalsBronze}**
          `, true)
        .addField('Competitive Stats', stripIndents`
        Final Blows: **${data.competitiveStats.careerStats.allHeroes.combat.finalBlows}**
        Deaths: **${data.competitiveStats.careerStats.allHeroes.combat.deaths}**
        Damage Dealt: **${data.competitiveStats.careerStats.allHeroes.combat.damageDone}**
        Healing: **${data.competitiveStats.careerStats.allHeroes.assists.healingDone}**
        Objective Kills: **${data.competitiveStats.careerStats.allHeroes.combat.objectiveKills}**
        Solo Kills: **${data.competitiveStats.careerStats.allHeroes.combat.soloKills}**
        Playtime: **${data.competitiveStats.careerStats.allHeroes.game.timePlayed}**
        Games Won: **${data.competitiveStats.games.won}**
        Golden Medals: **${data.competitiveStats.awards.medalsGold}**
        Silver Medals: **${data.competitiveStats.awards.medalsSilver}**
        Bronze Medals: **${data.competitiveStats.awards.medalsBronze}**
          `, true)
        .addField('top Heroes Quick Play', stripIndents`
        **${capitalizeFirstLetter(topQuickPlayHeroes[0].hero)}** (${moment.duration(topQuickPlayHeroes[0].time, 'milliseconds').format('H [hours]', 2)})
        **${capitalizeFirstLetter(topQuickPlayHeroes[1].hero)}** (${moment.duration(topQuickPlayHeroes[1].time, 'milliseconds').format('H [hours]', 2)})
        **${capitalizeFirstLetter(topQuickPlayHeroes[2].hero)}** (${moment.duration(topQuickPlayHeroes[2].time, 'milliseconds').format('H [hours]', 2)})
            `, true)
        .addField('Top Heroes Competitive', stripIndents`
        **${capitalizeFirstLetter(topCompetitiveHeroes[0].hero)}** (${moment.duration(topCompetitiveHeroes[0].time, 'milliseconds').format('H [hours]', 2)})
        **${capitalizeFirstLetter(topCompetitiveHeroes[1].hero)}** (${moment.duration(topCompetitiveHeroes[1].time, 'milliseconds').format('H [hours]', 2)})
        **${capitalizeFirstLetter(topCompetitiveHeroes[2].hero)}** (${moment.duration(topCompetitiveHeroes[2].time, 'milliseconds').format('H [hours]', 2)})
              `, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(owEmbed);
    } catch (err) {
      stopTyping(msg);

      if ((/(noplayer)/i).test(err.toString())) {
        return msg.reply('no player found by that name. Check the platform (`pc`, `psn` or `xbl`) and region (`us`, `eu` or `asia`)');
      } else if ((/(nostats)/i).test(err.toString())) {
        return msg.reply('player has been found but the player has no statistics logged yet. Heroes never die!');
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`overwatch\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Player:** ${player}
      **Platform:** ${platform}
      **Region:** ${region}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};