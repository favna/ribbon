/**
 * @file Moderation TempBanCommand - Temporary bans a member, then unbans them when the timer expires  
 * Given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`  
 * **Aliases**: `tb`, `rottenbanana`
 * @module
 * @category moderation
 * @name tempban
 * @example tempban Kai
 * @param {GuildMemberResolvable} AnyMember The member to ban from the server
 * @param {StringResolvable} Time The amount of time this member should be banned
 * @param {StringResolvable} [TheReason] Reason for this banishment. Include `--no-delete` anywhere in the reason to prevent the bot from deleting the banned member's messages
 * @returns {MessageEmbed} Log of the ban
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TempBanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tempban',
      memberName: 'tempban',
      group: 'moderation',
      aliases: ['tb', 'rottenbanana'],
      description: 'Temporary bans a member, then unbans them when the timer expires',
      format: 'MemberID|MemberName(partial or full) TimeForTheBan [ReasonForBanning]',
      examples: ['tempban JohnDoe 5m annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I ban?',
          type: 'member'
        },
        {
          key: 'time',
          prompt: 'How long should that member be banned?',
          type: 'string',
          validate: (t) => {
            if ((/^(?:[0-9]{1,2}(?:m|h|d){1})$/i).test(t)) {
              return true;
            }

            return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
          },
          parse: (t) => {
            const match = t.match(/[a-z]+|[^a-z]+/gi);
            let multiplier = 1;

            switch (match[1]) {
            case 'm':
              multiplier = 1;
              break;
            case 'h':
              multiplier = 60;
              break;
            case 'd':
              multiplier = 1440;
              break;
            default:
              multiplier = 1;
              break;
            }

            return parseInt(match[0], 10) * multiplier;
          }
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this banishment?',
          type: 'string',
          default: ''
        }
      ],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  run (msg, {member, time, reason, keepmessages = false}) {
    startTyping(msg);
    if (member.id === msg.author.id) {
      stopTyping(msg);

      return msg.reply('I don\'t think you want to ban yourself.');
    }

    if (!member.bannable) {
      stopTyping(msg);

      return msg.reply('I cannot ban that member, their role is probably higher than my own!');
    }

    if ((/--nodelete/im).test(msg.argString)) {
      reason = reason.substring(0, reason.indexOf('--nodelete')) + reason.substring(reason.indexOf('--nodelete') + '--nodelete'.length + 1);
      keepmessages = true;
    }

    member.ban({
      days: keepmessages ? 0 : 1,
      reason: reason !== '' ? reason : 'No reason given by staff'
    });

    const banEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      unbanEmbed = new MessageEmbed();

    banEmbed
      .setColor('#FF1900')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${member.user.tag} (${member.id})
      **Action:** Temporary Ban
      **Duration:** ${time} minute(s)
      **Reason:** ${reason !== '' ? reason : 'No reason given by staff'}`)
      .setTimestamp();

    unbanEmbed
      .setColor('#FF1900')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${member.user.tag} (${member.id})
      **Action:** Temporary ban removed`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: banEmbed}) : null;
    }

    setTimeout(() => {
      msg.guild.members.unban(member.user);
      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                        (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                        This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: unbanEmbed}) : null;
      }
      
      return msg.embed(unbanEmbed);
    }, time * 60000);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(banEmbed);
  }
};