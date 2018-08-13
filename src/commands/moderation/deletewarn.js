/**
 * @file Moderation DeleteWarnCommand - Deletes all or some warnings points from a user  
 * **Aliases**: `removewarn`, `unwarn`, `dw`, `uw`
 * @module
 * @category moderation
 * @name deletewarn
 * @example deletewarn favna
 * @example deletewarn favna
 * @param {MemberResolvable} AnyMember The member to remove warning points from
 * @param {Number} [AmountOfWarnPoints] The amount of warning points to remove
 * @returns {MessageEmbed} Confirmation of the action and the new warning points that user has
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class DeleteWarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deletewarn',
      memberName: 'deletewarn',
      group: 'moderation',
      aliases: ['removewarn', 'unwarn', 'dw', 'uw'],
      description: 'Deletes all or some warnings points from a user',
      format: 'MemberID|MemberName(partial or full) [AmountOfWarnPoints]',
      examples: ['deletewarn favna', 'deletewarn favna 5'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I remove warning points from?',
          type: 'member'
        },
        {
          key: 'points',
          prompt: 'How many warning points should I remove from this member?',
          type: 'integer',
          default: 999999
        }
      ],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {member, points}) {
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

      if (!query) return msg.reply('that user has no warnings points yet');

      const previousPoints = query.points; // eslint-disable-line one-var
      let newPoints = points === 999999 ? 0 : query.points - points;

      newPoints < 0 ? newPoints = 0 : null;

      conn.prepare(`UPDATE "${msg.guild.id}" SET points=$points WHERE id="${member.id}";`).run({points: newPoints});

      warnEmbed.setDescription(stripIndents`
        **Member:** ${member.user.tag} (${member.id})
        **Action:** Removed Warnings
        **Previous Warning Points:** ${previousPoints}
        **Current Warning Points:** ${newPoints}`);

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                                  (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                                  This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: warnEmbed}) : null;
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
          points: 0
        });

        return msg.reply('there were no warnings for that user yet, I created an entry and assigned 0 points');
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\`
                **Error Message:** ${err}
                `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};