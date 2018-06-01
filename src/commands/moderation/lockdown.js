/**
 * @file Moderation LockdownCommand - Lockdown a channel  
 * Once locked it will be locked to the `@everyone` or whichever role you specified.  
 * Depending on your permissions setup it may be that only people with the `administrator` role will have access to the channel.  
 * This may also mean that the bot won't have access if it doesn't have administrator role so you cannot use the `unlock` command until you give it that permission!  
 * **Aliases**: `lock`, `ld`
 * @module
 * @category moderation
 * @name lockdown
 * @returns {Message} Confirmation the channel was locked
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class LockdownCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lockdown',
      memberName: 'lockdown',
      group: 'moderation',
      aliases: ['lock', 'ld'],
      description: 'Locks the current channel to just staff',
      details: stripIndents`Once locked it will be locked to the \`@everyone\` or whichever role you specified.
      Depending on your permissions setup it may be that only people with the \`administrator\` role will have access to the channel.  
      This may also mean that the bot won't have access if it doesn't have administrator role so you cannot use the \`unlock\` command until you give it that permission!`,
      examples: ['lockdown'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'lockrole',
          prompt: 'Which role to apply the lockdown to?',
          type: 'role',
          default: 'everyone'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  async run (msg, {lockrole}) {
    startTyping(msg);
    const lockEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      overwrite = await msg.channel.overwritePermissions({
        overwrites: [
          {
            id: msg.member.roles.highest.id,
            allowed: ['SEND_MESSAGES', 'VIEW_CHANNEL']
          },
          {
            id: msg.guild.roles.find('name', lockrole === 'everyone' ? '@everyone' : lockrole.name).id,
            denied: ['SEND_MESSAGES']
          }
        ],
        reason: 'Channel Lockdown'
      });

    lockEmbed
      .setColor('#983553')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Action:** 🔒 locked the \`${msg.channel.name}\` channel.
      **Details:** Only staff can now access this channel. Use \`${msg.guild.commandPrefix}unlock\` in this channel to unlock the channel`)
      .setTimestamp();

    if (overwrite) {
      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                            (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                            This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: lockEmbed}) : null;
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(lockEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred locking this channel');
  }
};