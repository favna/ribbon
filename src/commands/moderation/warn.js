/**
 * @file Moderation WarnCommand - Gives a member warning points  
 * Please note that Ribbon will not auto ban when the member has a certain amount of points!  
 * **Aliases**: `warning`
 * @module
 * @category moderation
 * @name warn
 * @example warn Biscuit 5 Not giving everyone cookies
 * @param {GuildMemberResolvable} AnyMember The member to give warning points
 * @param {Number} WarningPoints The amount of warning points to give
 * @param {StringResolvable} TheReason Reason for warning
 * @returns {MessageEmbed} A MessageEmbed with a log of the warning
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class WarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'warn',
      memberName: 'warn',
      group: 'moderation',
      aliases: ['warning'],
      description: 'Warn a member with a specified amount of points',
      format: 'MemberID|MemberName(partial or full) AmountOfWarnPoints ReasonForWarning',
      examples: ['warn JohnDoe 1 annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I give a warning?',
          type: 'member'
        },
        {
          key: 'points',
          prompt: 'How many warning points should I give this member?',
          type: 'integer'
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this warning?',
          type: 'string',
          default: ''
        }
      ],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {member, points, reason}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/warnings.sqlite3')),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      warnEmbed = new MessageEmbed();

    warnEmbed
      .setColor('#FFFF00')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setTimestamp();

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT id,points FROM "${msg.guild.id}" WHERE id = ?;`).get(member.id);
      let newPoints = points,
        previousPoints = null;

      if (query) {
        previousPoints = query.points;
        newPoints += query.points;
        conn.prepare(`UPDATE "${msg.guild.id}" SET points=$points WHERE id="${member.id}";`).run({points: newPoints});
      } else {
        previousPoints = 0;
        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`).run({
          id: member.id,
          tag: member.user.tag,
          points
        });
      }

      warnEmbed.setDescription(stripIndents`
            **Member:** ${member.user.tag} (${member.id})
            **Action:** Warn
            **Previous Warning Points:** ${previousPoints}
            **Current Warning Points:** ${newPoints}
            **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}`);

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                                  (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                                  This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: warnEmbed}) : null;
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(warnEmbed);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id TEXT PRIMARY KEY, tag TEXT, points INTEGER);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`).run({
          id: member.id,
          tag: member.user.tag,
          points
        });
      } else {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
              <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
              **Server:** ${msg.guild.name} (${msg.guild.id})
              **Author:** ${msg.author.tag} (${msg.author.id})
              **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\` || \`${reason}\`
              **Error Message:** ${err}
              `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
              Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    warnEmbed.setDescription(stripIndents`
          **Member:** ${member.user.tag} (${member.id})
          **Action:** Warn
          **Previous Warning Points:** 0
          **Current Warning Points:** ${points}
          **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(warnEmbed);
  }
};