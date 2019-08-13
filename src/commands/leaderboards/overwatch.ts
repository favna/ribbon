/**
 * @file Leaderboards OverwatchCommand - Shows Player Stats for a given BattleNet BattleTag
 *
 * **Aliases**: `owstats`
 * @module
 * @category leaderboards
 * @name overwatch
 * @example overwatch Camoflouge#1267
 * @param {string} BattleTag BattleTag for that overwatch player
 * @param {string} [platform] Optiona: The platform the player is on. One of pc, psn or xbl
 * @param {string} [region] Optional: The region the player plays in. Of of us, eu, asia
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, sentencecase, removeNullAndUndefined } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { OverwatchData } from 'RibbonTypes';

type OverwatchArgs = {
  player: string;
  platform: string;
  region: string;
};

export default class OverwatchCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'overwatch',
      aliases: [ 'owstats' ],
      group: 'leaderboards',
      memberName: 'overwatch',
      description: 'Shows Player Stats for a given Overwatch player',
      format: 'BattleTag, [platform], [region]',
      examples: [ 'overwatch Camoflouge#1267' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'player',
          prompt: 'Respond with the player\'s BattleTag',
          type: 'string',
          validate: (tag: string) => {
            if (/[a-zA-Z0-9]+([#-][0-9]{4,5})?/i.test(tag)) {
              return true;
            }

            return 'Has to be in the format of <name>#<identifier>, for example `cats#11481`';
          },
          parse: (tag: string) => tag.replace(/#/g, '-'),
        },
        {
          key: 'platform',
          prompt: 'Respond with the platform that player plays on',
          type: 'string',
          oneOf: [ 'pc', 'psn', 'xbl' ],
          default: 'pc',
          parse: (plat: string) => plat.toLowerCase(),
        },
        {
          key: 'region',
          prompt: 'Respond with the region that player is playing in',
          type: 'string',
          oneOf: [ 'us', 'eu', 'asia' ],
          default: 'us',
          parse: (reg: string) => reg.toLowerCase(),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { player, platform, region }: OverwatchArgs) {
    try {
      const owData = await fetch(`https://ow-api.com/v1/stats/${platform}/${region}/${player}/complete`);
      const owEmbed = new MessageEmbed();
      const data: OverwatchData = await owData.json();

      if (data.error) throw new Error('noplayer');
      if (!data.competitiveStats.topHeroes) throw new Error('nostats');
      if (!data.quickPlayStats.topHeroes) throw new Error('nostats');

      const topCompetitiveHeroes = Object.keys(data.competitiveStats.topHeroes)
        .map(hero => {
          if (hero in data.competitiveStats.topHeroes) {
            const timePlayed = data.competitiveStats.topHeroes[hero].timePlayed
              .split(':')
              .map(time => parseFloat(time));

            const seconds = timePlayed.length === 3
              ? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
              : Number(timePlayed[0] * 60) + Number(timePlayed[1]);

            return { hero, time: seconds * 1000 };
          }

          return undefined;
        })
        .filter(removeNullAndUndefined)
        .sort((a, b) => a.time - b.time)
        .reverse()
        .slice(0, 3);
      const topQuickPlayHeroes = Object.keys(data.quickPlayStats.topHeroes)
        .map(hero => {
          if (hero in data.quickPlayStats.topHeroes) {
            const timePlayed = data.quickPlayStats.topHeroes[hero].timePlayed
              .split(':')
              .map(time => parseFloat(time));

            const seconds = timePlayed.length === 3
              ? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
              : Number(timePlayed[0] * 60) + Number(timePlayed[1]);

            return { hero, time: seconds * 1000 };
          }

          return undefined;
        })
        .filter(removeNullAndUndefined)
        .sort((a, b) => a.time - b.time)
        .reverse()
        .slice(0, 3);
      const quickPlayStats = data.quickPlayStats.careerStats;
      const competitiveStats = data.competitiveStats.careerStats;

      owEmbed
        .setAuthor(`Overwatch Player Statistics for ${data.name}`, `${ASSET_BASE_PATH}/ribbon/overwatch.png`)
        .setTitle('Click here for more details on overwatchtracker.com')
        .setURL(`https://overwatchtracker.com/profile/${platform}/global/${player}`)
        .setThumbnail(data.icon)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
        .addField(sentencecase('account stats'), stripIndents`
          Player Level: **${data.level}**
          Prestige level: **${data.level + (data.prestige * 100)}**
          Rank: **${data.rating ? data.rating : 'Unknown Rating'}${data.ratingName ? ` (${data.ratingName})` : ''}**
          Total Games Won: **${data.gamesWon ? data.gamesWon : 'No games won'}**
        `,
        true)
        .addBlankField(true)
        .addField(sentencecase('quickplay stats'), stripIndents`
          Final Blows: **${quickPlayStats.allHeroes.combat.finalBlows}**
          Deaths: **${quickPlayStats.allHeroes.combat.deaths}**
          Damage Dealt: **${quickPlayStats.allHeroes.combat.damageDone}**
          Healing: **${quickPlayStats.allHeroes.assists.healingDone}**
          Objective Kills: **${quickPlayStats.allHeroes.combat.objectiveKills}**
          Solo Kills: **${quickPlayStats.allHeroes.combat.soloKills}**
          Playtime: **${quickPlayStats.allHeroes.game.timePlayed}**
          Games Won: **${data.quickPlayStats.games.won}**
          Golden Medals: **${data.quickPlayStats.awards.medalsGold}**
          Silver Medals: **${data.quickPlayStats.awards.medalsSilver}**
          Bronze Medals: **${data.quickPlayStats.awards.medalsBronze}**
        `,
        true)
        .addField(sentencecase('competitive stats'), stripIndents`
          Final Blows: **${competitiveStats.allHeroes.combat.finalBlows}**
          Deaths: **${competitiveStats.allHeroes.combat.deaths}**
          Damage Dealt: **${competitiveStats.allHeroes.combat.damageDone}**
          Healing: **${competitiveStats.allHeroes.assists.healingDone}**
          Objective Kills: **${competitiveStats.allHeroes.combat.objectiveKills}**
          Solo Kills: **${competitiveStats.allHeroes.combat.soloKills}**
          Playtime: **${competitiveStats.allHeroes.game.timePlayed}**
          Games Won: **${data.competitiveStats.games.won}**
          Golden Medals: **${data.competitiveStats.awards.medalsGold}**
          Silver Medals: **${data.competitiveStats.awards.medalsSilver}**
          Bronze Medals: **${data.competitiveStats.awards.medalsBronze}**
        `,
        true)
        .addField(sentencecase('top heroes quick play'), stripIndents`
          **${sentencecase(topQuickPlayHeroes[0].hero)}** (${moment.duration(topQuickPlayHeroes[0].time, 'milliseconds').format('H [hrs] - m [min]')})
          **${sentencecase(topQuickPlayHeroes[1].hero)}** (${moment.duration(topQuickPlayHeroes[1].time, 'milliseconds').format('H [hrs] - m [min]')})
          **${sentencecase(topQuickPlayHeroes[2].hero)}** (${moment.duration(topQuickPlayHeroes[2].time, 'milliseconds').format('H [hrs] - m [min]')})
        `,
        true)
        .addField(sentencecase('top heroes competitive'), stripIndents`
          **${sentencecase(topCompetitiveHeroes[0].hero)}** (${moment.duration(topCompetitiveHeroes[0].time, 'milliseconds').format('H [hr] - m [min]')})
          **${sentencecase(topCompetitiveHeroes[1].hero)}** (${moment.duration(topCompetitiveHeroes[1].time, 'milliseconds').format('H [hr] - m [min]')})
          **${sentencecase(topCompetitiveHeroes[2].hero)}** (${moment.duration(topCompetitiveHeroes[2].time, 'milliseconds').format('H [hr] - m [min]')})
        `,
        true);

      deleteCommandMessages(msg, this.client);

      return msg.embed(owEmbed);
    } catch (err) {
      if (/noplayer/i.test(err.toString())) {
        return msg.reply('no player found by that name. Check the platform (`pc`, `psn` or `xbl`) and region (`us`, `eu` or `asia`)');
      }
      if (/nostats/i.test(err.toString())) {
        return msg.reply('player has been found but the player has no statistics logged yet. Heroes never die!');
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`overwatch\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Player:** ${player}
        **Platform:** ${platform}
        **Region:** ${region}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
}