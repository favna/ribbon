/**
 * @file Leaderboards FortniteCommand - Get Player Statistics from Fortnite  
 * **Aliases**: `fort`, `fortshite`
 * @module
 * @category leaderboards
 * @name fortnite
 * @example fortnite darkentz014 pc
 * @param {StringResolvable} Username The Epic Username of the player you want to find
 * @param {StringResolvable} Platform The platform the player plays on (pc, xbox or psn)
 * @returns {MessageEmbed} Player Statistics from that player
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class FortniteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fortnite',
      memberName: 'fortnite',
      group: 'leaderboards',
      aliases: ['fort', 'fortshite'],
      description: 'Get Player Statistics from Fortnite',
      format: 'User Platform',
      examples: ['fortnite darkentz014 pc'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'user',
          prompt: 'What epic user to find?',
          type: 'string'
        },
        {
          key: 'platform',
          prompt: 'What platform do they play on (`pc`, `xbox` or `psn`)?',
          type: 'string',
          validate: v => (/(pc|xbox|psn)/i).test(v) ? true : 'has to be a valid platform, one of `pc`, `xbox` or `psn`',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  async run (msg, {user, platform}) {
    try {
      startTyping(msg);

      const res = await fetch(`https://api.fortnitetracker.com/v1/profile/${platform}/${user}`, {headers: {'TRN-Api-Key': process.env.trnkey}}),
        stats = await res.json(),
        fortEmbed = new MessageEmbed();

      if (stats.error) throw new Error('noplayer');

      fortEmbed
        .setTitle(`Fortnite Player Statistics for ${stats.epicUserHandle}`)
        .setURL(`https://fortnitetracker.com/profile/${stats.platformName}/${stats.epicUserHandle}`)
        .setThumbnail('https://nintendowire.com/wp-content/uploads/2018/06/FortniteSwitch.jpg')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Lifetime Stats', stripIndents`
        Wins: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'wins')[0].value}**
        Kills: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'kills')[0].value}**
        KDR: **${parseFloat(stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'k/d')[0].value, 10) * 100}%**
        Matches Played: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'matches played')[0].value}**
        Top 3s: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'top 3s')[0].value}**
        Top 5s: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'top 5s')[0].value}**
        Top 10s: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'top 10')[0].value}**
        Top 25s: **${stats.lifeTimeStats.filter(el => el.key.toLowerCase() === 'top 25s')[0].value}**
        `, true)
        .addField('Solos', stripIndents`
        Wins: **${stats.stats.p2.top1.value}**
        Kills: **${stats.stats.p2.kills.value}**
        KDR: **${parseFloat(stats.stats.p2.kd.value, 10) * 100}%**
        Matches Played: **${stats.stats.p2.matches.value}**
        Top 3s: **${stats.stats.p2.top3.value}**
        Top 5s: **${stats.stats.p2.top5.value}**
        Top 10s: **${stats.stats.p2.top10.value}**
        Top 25s: **${stats.stats.p2.top25.value}**
        `, true);

      stats.stats.p10 ? fortEmbed.addField('Duos', stripIndents`
        Wins: **${stats.stats.p10.top1.value}**
        Kills: **${stats.stats.p10.kills.value}**
        KDR: **${parseFloat(stats.stats.p10.kd.value, 10) * 100}%**
        Matches Played: **${stats.stats.p10.matches.value}**
        Top 3s: **${stats.stats.p10.top3.value}**
        Top 5s: **${stats.stats.p10.top5.value}**
        Top 10s: **${stats.stats.p10.top10.value}**
        Top 25s: **${stats.stats.p10.top25.value}**
        `, true) : null;

      stats.stats.p9 ? fortEmbed.addField('Squads', stripIndents`
        Wins: **${stats.stats.p9.top1.value}**
        Kills: **${stats.stats.p9.kills.value}**
        KDR: **${parseFloat(stats.stats.p9.kd.value, 10) * 100}%**
        Matches Played: **${stats.stats.p9.matches.value}**
        Top 3s: **${stats.stats.p9.top3.value}**
        Top 5s: **${stats.stats.p9.top5.value}**
        Top 10s: **${stats.stats.p9.top10.value}**
        Top 25s: **${stats.stats.p9.top25.value}**
        `, true) : null;

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fortEmbed);
    } catch (err) {
      stopTyping(msg);

      if ((/(noplayer)/i).test(err.toString())) {
        return msg.reply('no player found by that name. Check the platform (`pc`, `xbox` or `psn`)');
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`fortnite\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Player:** ${user}
      **Platform:** ${platform}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};