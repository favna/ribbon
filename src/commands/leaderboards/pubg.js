/**
 * @file Leaderboards PubgCommand - Get statistics from a PUBG account  
 * @module
 * @category leaderboards
 * @name pubg
 * @example pubg shroud pc-na
 * @param {StringResolvable} PubgUsername The username you want to find statistics for
 * @param {StringResolvable} Shard A combination of platform and region to look through, for example `pc-na` for PC in North America
 * @returns {MessageEmbed} Statistics of that user
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pubg',
      memberName: 'pubg',
      group: 'leaderboards',
      description: 'Get statistics from a PUBG account',
      format: 'PubgUsername Shard',
      examples: ['pubg shroud pc-na'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'user',
          prompt: 'What is the username to find data for?',
          type: 'string'
        },
        {
          key: 'shard',
          prompt: stripIndents`what platform and region does that player play in.
                                \`\`\`
                                Valid Options

                                xbox-as - Asia
                                xbox-eu - Europe
                                xbox-na - North America
                                xbox-oc - Oceania
                                pc-krjp - Korea
                                pc-jp - Japan
                                pc-na - North America
                                pc-eu - Europe
                                pc-ru - Russia
                                pc-oc - Oceania
                                pc-kakao - Kakao
                                pc-sea - South East Asia
                                pc-sa - South and Central America
                                pc-as - Asia
                                \`\`\``,
          type: 'string',
          validate: v => (/(xbox-as|xbox-eu|xbox-na|xbox-oc|pc-krjp|pc-jp|pc-na|pc-eu|pc-ru|pc-oc|pc-kakao|pc-sea|pc-sa|pc-as)/im).test(v)
            ? true
            : stripIndents`has to be a valid platform and region. 
                            \`\`\`
                            Valid Options

                            xbox-as - Asia
                            xbox-eu - Europe
                            xbox-na - North America
                            xbox-oc - Oceania
                            pc-krjp - Korea
                            pc-jp - Japan
                            pc-na - North America
                            pc-eu - Europe
                            pc-ru - Russia
                            pc-oc - Oceania
                            pc-kakao - Kakao
                            pc-sea - South East Asia
                            pc-sa - South and Central America
                            pc-as - Asia
                            \`\`\``,
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  async run (msg, {user, shard}) {
    try {
      startTyping(msg);
      /* eslint-disable sort-vars*/
      const seasons = await request.get(`https://api.pubg.com/shards/${shard}/seasons`)
          .set('Authorization', `Bearer ${process.env.pubgkey}`)
          .set('Accept', 'application/vnd.api+json'),
        players = await request.get(`https://api.pubg.com/shards/${shard}/players`)
          .query('filter[playerNames]', user)
          .set('Authorization', `Bearer ${process.env.pubgkey}`)
          .set('Accept', 'application/vnd.api+json'),
        currentSeason = seasons.body.data.filter(season => season.attributes.isCurrentSeason)[0].id,
        playerId = players.body.data[0].id,
        playerName = players.body.data[0].attributes.name,
        playerStats = await request.get(`https://api.pubg.com/shards/${shard}/players/${playerId}/seasons/${currentSeason}`)
          .set('Authorization', `Bearer ${process.env.pubgkey}`)
          .set('Accept', 'application/vnd.api+json'),
        {data} = playerStats.body,
        pubEmbed = new MessageEmbed();
      /* eslint-enable sort-vars*/

      pubEmbed
        .setTitle(`PUBG Player Statistics for ${playerName}`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/pubgicon.png')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Duos Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats.duo.wins}**
          Losses: **${data.attributes.gameModeStats.duo.losses}**
          Assists: **${data.attributes.gameModeStats.duo.assists}**
          Kills: **${data.attributes.gameModeStats.duo.kills}**
          Headshot Kills: **${data.attributes.gameModeStats.duo.headshotKills}**
          Road Kills: **${data.attributes.gameModeStats.duo.roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats.duo.maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats.duo.suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats.duo.weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats.duo.rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats.duo.walkDistance}**
          `, true)
        .addField('Duos FPP Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats['duo-fpp'].wins}**
          Losses: **${data.attributes.gameModeStats['duo-fpp'].losses}**
          Assists: **${data.attributes.gameModeStats['duo-fpp'].assists}**
          Kills: **${data.attributes.gameModeStats['duo-fpp'].kills}**
          Headshot Kills: **${data.attributes.gameModeStats['duo-fpp'].headshotKills}**
          Road Kills: **${data.attributes.gameModeStats['duo-fpp'].roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats['duo-fpp'].maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats['duo-fpp'].suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats['duo-fpp'].weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats['duo-fpp'].rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats['duo-fpp'].walkDistance}**
          `, true)
        .addField('Solos Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats.solo.wins}**
          Losses: **${data.attributes.gameModeStats.solo.losses}**
          Assists: **${data.attributes.gameModeStats.solo.assists}**
          Kills: **${data.attributes.gameModeStats.solo.kills}**
          Headshot Kills: **${data.attributes.gameModeStats.solo.headshotKills}**
          Road Kills: **${data.attributes.gameModeStats.solo.roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats.solo.maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats.solo.suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats.solo.weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats.solo.rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats.solo.walkDistance}**
          `, true)
        .addField('Solos FPP Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats['solo-fpp'].wins}**
          Losses: **${data.attributes.gameModeStats['solo-fpp'].losses}**
          Assists: **${data.attributes.gameModeStats['solo-fpp'].assists}**
          Kills: **${data.attributes.gameModeStats['solo-fpp'].kills}**
          Headshot Kills: **${data.attributes.gameModeStats['solo-fpp'].headshotKills}**
          Road Kills: **${data.attributes.gameModeStats['solo-fpp'].roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats['solo-fpp'].maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats['solo-fpp'].suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats['solo-fpp'].weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats['solo-fpp'].rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats['solo-fpp'].walkDistance}**
          `, true)
        .addField('Squad Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats.squad.wins}**
          Losses: **${data.attributes.gameModeStats.squad.losses}**
          Assists: **${data.attributes.gameModeStats.squad.assists}**
          Kills: **${data.attributes.gameModeStats.squad.kills}**
          Headshot Kills: **${data.attributes.gameModeStats.squad.headshotKills}**
          Road Kills: **${data.attributes.gameModeStats.squad.roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats.squad.maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats.squad.suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats.squad.weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats.squad.rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats.squad.walkDistance}**
          `, true)
        .addField('Squad FPP Stats', stripIndents`
          Wins: **${data.attributes.gameModeStats['squad-fpp'].wins}**
          Losses: **${data.attributes.gameModeStats['squad-fpp'].losses}**
          Assists: **${data.attributes.gameModeStats['squad-fpp'].assists}**
          Kills: **${data.attributes.gameModeStats['squad-fpp'].kills}**
          Headshot Kills: **${data.attributes.gameModeStats['squad-fpp'].headshotKills}**
          Road Kills: **${data.attributes.gameModeStats['squad-fpp'].roadKills}**
          Longest Kill Streak: **${data.attributes.gameModeStats['squad-fpp'].maxKillStreaks}**
          Suicides: **${data.attributes.gameModeStats['squad-fpp'].suicides}**
          Weapons Acquired: **${data.attributes.gameModeStats['squad-fpp'].weaponsAcquired}**
          Drive Distance: **${data.attributes.gameModeStats['squad-fpp'].rideDistance}**
          Walk Distance: **${data.attributes.gameModeStats['squad-fpp'].walkDistance}**
          `, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pubEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`pubg\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **User:** ${user}
      **Shard:** ${shard}
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};