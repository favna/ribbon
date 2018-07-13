/**
 * @file Moderation ListWarnCommand - Show the amount of warning points a member has  
 * **Aliases**: `reqwarn`, `lw`, `rw`
 * @module
 * @category moderation
 * @name listwarn
 * @example listwarn Biscuit
 * @param {GuildMemberResolvable} AnyMember The member of whom to list the warning points
 * @returns {MessageEmbed} The warnings that member has
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ListWarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'listwarn',
      memberName: 'listwarn',
      group: 'moderation',
      aliases: ['reqwarn', 'lw', 'rw'],
      description: 'Lists the warning points given to a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['listwarn Biscuit'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I show warning points for?',
          type: 'member'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {member}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/warnings.sqlite3')),
      embed = new MessageEmbed();

    embed
      .setColor('#ECECC9')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setTimestamp();

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE id= ?;`).get(member.id);

      embed.setDescription(stripIndents`**Member:** ${query.tag} (${query.id})
                  **Current warning Points:** ${query.points}`);
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no warnpoints found for this server, it will be created the first time you use the \`${msg.guild.commandPrefix}warn\` command`);
      }
      if ((/(?:TypeError: Cannot read property 'tag')/i).test(err.toString())) {
        embed.setDescription(stripIndents`**Member:** ${member.user.tag} (${member.id})
        **Current warning Points:** 0`);

        return msg.embed(embed);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`listwarn\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.tag} (${member.id})\`
        **Error Message:** ${err}
        `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
              Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};