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
 */

import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components/util';

export default class SoftbanCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'softban',
      aliases: [ 'sb', 'sban' ],
      group: 'moderation',
      memberName: 'softban',
      description: 'Kicks a member while also purging messages from the last 24 hours',
      format: 'MemberID|MemberName(partial or full) [ReasonForSoftbanning]',
      examples: [ 'softban JohnDoe annoying' ],
      guildOnly: true,
      clientPermissions: [ 'BAN_MEMBERS' ],
      userPermissions: [ 'BAN_MEMBERS' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I softban?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this softban?',
          type: 'string',
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { member, reason }: {member: GuildMember, reason: string}) {
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
      reason,
    });

    msg.guild.members.unban(member.user);

    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const softbanEmbed = new MessageEmbed();

    softbanEmbed
      .setColor('#FF8300')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${member.user.tag} (${member.id})
      **Action:** Softban
      **Reason:** ${reason}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, softbanEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(softbanEmbed);
  }
}