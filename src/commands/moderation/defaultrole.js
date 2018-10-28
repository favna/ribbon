/**
 * @file Moderation defaultroleCommand - Sets a default role that should be assigned to all new joining members  
 * **Aliases**: `defrole`
 * @module
 * @category moderation
 * @name defaultrole
 * @example defaultrole Member
 * @param {RoleResolvable} AnyRole Role to assign to all new joining members
 * @returns {Message} Confirmation the setting was stored
 */

import {Command} from 'discord.js-commando'; 
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags'; 
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class defaultroleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'defaultrole',
      memberName: 'defaultrole',
      group: 'moderation',
      aliases: ['defrole'],
      description: 'Set a default role Ribbon will assign to any members joining after this command',
      details: 'Use "delete" to remove the default role',
      format: 'RoleID|RoleName(partial or full)',
      examples: ['defaultrole Member'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'role',
          prompt: 'Which role would you like to set as the default role?',
          type: 'role',
          default: 'delete'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {role}) {
    startTyping(msg);
    const defRoleEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    let description = oneLine`🔓 \`${role.name}\` has been set as the default role for this server and will now be granted to all people joining`;

    if (role === 'delete') {
      msg.guild.settings.remove('defaultRole');
      description = 'Default role has been removed';
    } else {
      msg.guild.settings.set('defaultRole', role.id);
    }

    defRoleEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** ${description}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: defRoleEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(defRoleEmbed);
  }
};