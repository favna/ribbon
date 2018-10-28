/**
 * @file Moderation MuteCommand - Mute a member  
 * Requires either a role named `muted` on the server, or first having set the mute role with confmute  
 * You can optionally specify a duration for how long this mute will last. Not specifying any will mean it will last until manually unmuted.  
 * The format for duration is in minutes, hours or days in the format of `5m`, `2h` or `1d`  
 * **Aliases**: `silent`
 * @module
 * @category moderation
 * @name mute
 * @example mute Muffin
 * @param {GuildMemberResolvable} AnyMember Member to mute
 * @returns {MessageEmbed} Mute log
 */

import moment from 'moment';
import ms from 'ms';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class MuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mute',
      memberName: 'mute',
      group: 'moderation',
      aliases: ['silent'],
      description: 'Mute a member',
      details: stripIndents`Requires either a role named \`muted\` on the server, or first having set the mute role with confmute
      You can optionally specify a duration for how long this mute will last. Not specifying any will mean it will last until manually unmuted.
      The format for duration is in minutes, hours or days in the format of \`5m\`, \`2h\` or \`1d\``,
      format: 'MemberID|MemberName(partial or full) [DurationForMute]',
      examples: ['mute Muffin 2h'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I mute?',
          type: 'member'
        },
        {
          key: 'duration',
          prompt: 'For how long should they be muted?',
          type: 'string',
          default: '',
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

            return parseInt(match[0], 10) * multiplier * 60000;
          }
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  async run (msg, {member, duration}) {
    if (member.manageable) {
      startTyping(msg);
      try {
        const modlogChannel = msg.guild.settings.get('modlogchannel',
            msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
          muteRole = msg.guild.settings.get('muterole',
            msg.guild.roles.find(r => r.name === 'muted') ? msg.guild.roles.find(r => r.name === 'muted') : null),
          muteEmbed = new MessageEmbed();

        await member.roles.add(muteRole);

        muteEmbed
          .setColor('#AAEFE6')
          .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
          .setDescription(stripIndents`
            **Action:** Muted <@${member.id}>
            **Duration:** ${duration ? ms(duration, {long: true}) : 'Until manually removed'}`)
          .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
          if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
            msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
            msg.guild.settings.set('hasSentModLogMessage', true);
          }
          modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: muteEmbed}) : null;
          this.logs = true;
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        const muteMessage = await msg.embed(muteEmbed); // eslint-disable-line one-var

        if (duration) {
          setTimeout(async () => {
            await member.roles.remove(muteRole);
            muteEmbed.setDescription(stripIndents`**Action:** Mute duration ended, unmuted ${member.displayName} (<@${member.id}>)`);
            this.logs ? msg.guild.channels.get(modlogChannel).send('', {embed: muteEmbed}) : null;

            return muteMessage.edit('', {embed: muteEmbed});
          }, duration);
        }

        return muteMessage;
      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        if ((/(?:Missing Permissions)/i).test(err.toString())) {

          return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
          Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
        }
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.username} (${member.id})\` ${duration ? ` || \`${ms(duration, {long: true})}` : null}
        **Error Message:** ${err}
        `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
		Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
  }
};