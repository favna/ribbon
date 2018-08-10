/**
 * @file Moderation ConfigureMuteCommand - Configure which role to use as "mute" role  
 * **Aliases**: `cm`, `configmute` 
 * @module
 * @category moderation
 * @name confmute
 * @example confmute mute
 * @param {RoleResolvable} Role Role to set as mute role
 * @returns {MessageEmbed} Configuration log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ConfigureMuteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'confmute',
      memberName: 'confmute',
      group: 'moderation',
      aliases: ['cm', 'configmute'],
      description: 'Configure which role to use as "mute" role',
      format: 'RoleResolvable',
      examples: ['confmute mute'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'role',
          prompt: 'Which role should be set as the mute role?',
          type: 'role'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {role}) {
    startTyping(msg);

    const confMuteEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    msg.guild.settings.set('muterole', role.id);

    confMuteEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
    **Action:** Configured mute role to \`${role.name}\``)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
            (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
            This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: confMuteEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(confMuteEmbed);
  }
};