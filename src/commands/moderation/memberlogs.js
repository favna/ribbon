/**
 * @file Moderation MemberLogsCommand - Toggle member logs in the member-logs (or by you configured with setmemberlogs) channel  
 * **Aliases**: `tml`, `togglemember`, `togglememberlogs`
 * @module
 * @category moderation
 * @name memberlogs
 * @example memberlogs enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Memberlogs confirmation log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MemberLogsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'memberlogs',
      memberName: 'memberlogs',
      group: 'moderation',
      aliases: ['tml', 'togglemember', 'togglememberlogs'],
      description: 'Toggle member logs in the member-logs (or by you configured with setmemberlogs) channel',
      format: 'BooleanResolvable',
      examples: ['memberlogs enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable memberlogs?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return stripIndents`Has to be one of ${validBools.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          }
        }
      ],
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {option}) {
    startTyping(msg);

    const memberLogsEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    msg.guild.settings.set('memberlogs', option);

    memberLogsEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
  **Action:** Member logs are now ${option ? 'enabled' : 'disabled'}
  **Details:** Please ensure you configure memberlogs with \`${msg.guild.commandPrefix}setmodlogs\` or have a channel named \`member-logs\`
  `)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: memberLogsEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(memberLogsEmbed);
  }
};