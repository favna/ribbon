/**
 * @file Moderation SoftbanCommand - Bans a member deleting their messages and then unbans them allowing them to rejoin (no invite link is shared)  
 * This is essentially a kick with the added effect of deleting all their past messages from the last 24 hours  
 * **Aliases**: `sb`, `sban`
 * @module
 * @category moderation
 * @name softban
 * @example softban ImmortalZypther
 * @param {GuildMemberResolvable} AnyMember The member to softban from the server
 * @param {StringResolvable} TheReason Reason for this softban.
 * @returns {MessageEmbed} A MessageEmbed with a log of the softban
 */

import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class SoftbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'softban',
      memberName: 'softban',
      group: 'moderation',
      aliases: ['sb', 'sban'],
      description: 'Kicks a member while also purging messages from the last 24 hours',
      format: 'MemberID|MemberName(partial or full) [ReasonForSoftbanning]',
      examples: ['softban JohnDoe annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I softban?',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this softban?',
          type: 'string'
        }
      ],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  run (msg, {member, reason}) {
    startTyping(msg);
    if (member.id === msg.author.id) {
      stopTyping(msg);

      return msg.reply('I don\'t think you want to softban yourself.');
    }

    if (!member.bannable) {
      stopTyping(msg);

      return msg.reply('I cannot softban that member, their role is probably higher than my own!');
    }

    member.ban({
      days: 1,
      reason
    });

    msg.guild.members.unban(member.user);

    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      softbanEmbed = new MessageEmbed();

    softbanEmbed
      .setColor('#FF8300')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${member.user.tag} (${member.id})
      **Action:** Softban
      **Reason:** ${reason}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }

      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: softbanEmbed}) : null;
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(softbanEmbed);
  }
};