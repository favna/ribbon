/**
 * @file Moderation RegexMatchToggleCommand - Toggle commands matching on regex for this server  
 * **Aliases**: `rmt`, `regexmatch`
 * @module
 * @category moderation
 * @name regexmatchtoggle
 * @example regexmatchtoggle enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class RegexMatchToggleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'regexmatchtoggle',
      memberName: 'regexmatchtoggle',
      group: 'moderation',
      aliases: ['rmt', 'regexmatch'],
      description: 'Toggle commands matching on regex for this server',
      format: 'BooleanResolvable',
      examples: ['regexmatchtoggle enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable regex matches?',
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
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  run (msg, {option}) {
    startTyping(msg);

    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      regexMatchEmbed = new MessageEmbed();

    msg.guild.settings.set('regexmatches', option);

    regexMatchEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(oneLine`**Action:** Pattern matching commands are now ${option ? 'enabled' : 'disabled'}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: regexMatchEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(regexMatchEmbed);
  }
};