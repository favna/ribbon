/**
 * @file Leaderboards RocketLeagueCommand - Shows Rocket League Leaderboard      
 * **Aliases**: `rlstats`, `rocketstats`
 * @module
 * @category leaderboards
 * @name rocketleague
 * @example rocketleague
 * @returns {MessageEmbed} Top 10 ranking players by their amount of wins
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class RocketLeagueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rocketleague',
      memberName: 'rocketleague',
      group: 'leaderboards',
      aliases: ['rlstats'],
      description: 'Shows Rocket League Leaderboard',
      format: 'BattleTag',
      examples: ['rocketleague'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    startTyping(msg);

    try {
      const rocketData = await request.get('https://api.rocketleaguestats.com/v1/leaderboard/stat')
          .set('Authorization', process.env.rocketleaguekey)
          .query('type', 'goals'),
        rocketEmbed = new MessageEmbed(),
        rocketEngine = {
          names: rocketData.body.map(n => n.displayName).slice(0, 10),
          wins: rocketData.body.map(w => w.stats.wins).slice(0, 10),
          mvps: rocketData.body.map(m => m.stats.mvps).slice(0, 10),
          saves: rocketData.body.map(sa => sa.stats.saves).slice(0, 10),
          goals: rocketData.body.map(g => g.stats.goals).slice(0, 10),
          shots: rocketData.body.map(sh => sh.stats.shots).slice(0, 10),
          assists: rocketData.body.map(a => a.stats.assists).slice(0, 10)
        };

      for (const rank in rocketEngine.names) {
        rocketEmbed.addField(`${parseInt(rank, 10) + 1}: ${rocketEngine.names[rank]}`, stripIndents`
          **Wins**:${rocketEngine.wins[rank]}
          **MVPS**:${rocketEngine.mvps[rank]}
          **Saves**:${rocketEngine.saves[rank]}
          **Goals**:${rocketEngine.goals[rank]}
          **Shots**:${rocketEngine.shots[rank]}
          **Assists**:${rocketEngine.assists[rank]}
          `, true);
      }

      rocketEmbed
        .setTitle('Rocket League Top 10 Players')
        .setDescription('based on goals made by player')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/rocketleague.png');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(rocketEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`remind\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};