/**
 * @file Moderation UnmuteCommand - Unmutes a previously muted member
 * **Aliases**: `um`
 * @module
 * @category moderation
 * @name unmute
 * @example unmute Muffin
 * @param {GuildMemberResolvable} AnyMember The member to remove a role from
 * @returns {MessageEmbed} Unmute log
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class UnmuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unmute',
      memberName: 'unmute',
      group: 'moderation',
      aliases: ['um'],
      description: 'Unmutes a previously muted member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['unmute Muffin'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I unmute?',
          type: 'member'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_ROLES');
  }

  async run (msg, {member}) {
    if (member.manageable) {
      startTyping(msg);
      try {
        const modlogChannel = msg.guild.settings.get('modlogchannel',
            msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
          muteRole = msg.guild.settings.get('muterole',
            msg.guild.roles.find(r => r.name === 'muted') ? msg.guild.roles.find(r => r.name === 'muted') : null),
          muteRoleEmbed = new MessageEmbed();

        await member.roles.remove(muteRole);

        muteRoleEmbed
          .setColor('#4A9E93')
          .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
          .setDescription(stripIndents`**Action:** Unmuted ${member.displayName} (<@${member.id}>)`)
          .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
          if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
            msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
            msg.guild.settings.set('hasSentModLogMessage', true);
          }
          modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: muteRoleEmbed}) : null;
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(muteRoleEmbed);

      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        if ((/(?:Missing Permissions)/i).test(err.toString())) {

          return msg.reply(stripIndents`an error occurred unmuting \`${member.displayName}\`.
          Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
        }
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`deleterole\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(stripIndents`an error occurred unmuting \`${member.displayName}\`.
    Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
  }
};