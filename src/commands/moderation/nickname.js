/**
 * @file Moderation NickCommand - Nickname a single member  
 * **Aliases**: `nick`
 * @module
 * @category moderation
 * @name nickname
 * @example nick Muffin Cupcake
 * @param {GuildMemberResolvable} AnyMember Member to give a nickname
 * @param {StringResolvable} NewNickname Nickname to assign
 * @returns {MessageEmbed} Nickname log
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'),  
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class NickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nickname',
      memberName: 'nickname',
      group: 'moderation',
      aliases: ['nick'],
      description: 'Assigns a nickname to a member. Use "clear" to remove the nickname',
      format: 'MemberID|MemberName(partial or full) NewNickname|clear',
      examples: ['nick favna pyrrha nikos'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I assign a nickname to?',
          type: 'member'
        },
        {
          key: 'nickname',
          prompt: 'What nickname should I assign?',
          type: 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES');
  }

  run (msg, {member, nickname}) {
    startTyping(msg);
    if (member.manageable) {

      const modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
        nicknameEmbed = new MessageEmbed(),
        oldName = member.displayName;

      try {
        if (nickname === 'clear') {
          member.setNickname('');
        } else {
          member.setNickname(nickname);
        }

        nicknameEmbed
          .setColor('#3DFFE5')
          .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
          .setDescription(stripIndents`
        **Action:** Nickname change'}
        **Member:** <@${member.id}> (${member.user.tag})
        **Old name:** ${oldName}
        **New name:** ${nickname}
        `)
          .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
          if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
            msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                      (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                      This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
            msg.guild.settings.set('hasSentModLogMessage', true);
          }
          modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: nicknameEmbed}) : null;
        }
      
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
      
        return msg.embed(nicknameEmbed);
      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`nickname\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.tag} (${member.id})\` || \`${nickname}\`
        **Error Message:** ${err}
        `);
  
        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`failed to set nickname to that member.
    Check that I have permission to set their nickname as well as the role hierarchy`);
  }
};