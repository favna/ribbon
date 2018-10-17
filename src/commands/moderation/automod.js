/**
 * @file Moderation AutomodCommand - General toggle for all automod features  
 * **Aliases**: `botmod`, `skynetmod`  
 * @module
 * @category moderation
 * @name automod
 * @example automod enable
 * @param {BooleanResolvable} Option True or False
 * @param {RoleResolvable} [Roles] Roles that are exempted from automod
 * @returns {MessageEmbed} automod confirmation log
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class AutomodCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'automod',
      memberName: 'automod',
      group: 'moderation',
      aliases: ['botmod', 'skynetmod'],
      description: 'General toggle for all automod features',
      format: 'BooleanResolvable [RoleResolvable(s)]',
      examples: ['automod enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable Unknown Command messages?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return stripIndents`Has to be one of ${validBools.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          }
        },
        {
          key: 'roles',
          prompt: 'What roles, if any, should be exempt from automod? End with `finish` when you replied all role names (if any)',
          type: 'role',
          default: '',
          infinite: true
        }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {option, roles}) {
    startTyping(msg);

    const automodEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        filterroles: roles ? roles.map(r => r.id) : []
      };

    msg.guild.settings.set('automod', options);

    automodEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Automod features are now ${option ? 'enabled' : 'disabled'}
      **Notice:** Be sure to enable your desired individual features, they are all off by default!
      ${roles ? `**Roles exempted from automod**: ${roles.map(val => `\`${val.name}\``).join(', ')}` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: automodEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(automodEmbed);
  }
};