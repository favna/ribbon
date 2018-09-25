/**
 * @file Moderation SetAnnounceCommand - Set the channel for the announce command  
 * **Aliases**: `sa`, `setannouncement`, `setannouncements`
 * @module
 * @category moderation
 * @name setannounce
 * @example setannounce #updates
 * @param {ChannelResolvable} AnnounceChannel The channel to set the announcements to
 * @returns {MessageEmbed} Confirmation of the setting being stored
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SetAnnounceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'setannounce',
      memberName: 'setannounce',
      group: 'moderation',
      aliases: ['sa', 'setannouncement', 'setannouncements'],
      description: 'Set the channel for the announce command',
      format: 'ChannelID|ChannelName(partial or full)',
      examples: ['setannounce #updates'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'channel',
          prompt: 'To what channel should I change the announcements?',
          type: 'channel'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {channel}) {
    startTyping(msg);

    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      setAnnouncementEmbed = new MessageEmbed();

    msg.guild.settings.set('announcechannel', channel.id);

    setAnnouncementEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
            **Action:** Announcements Channel channel changed
            **Channel:** <#${channel.id}>`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: setAnnouncementEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(setAnnouncementEmbed);

  }
};