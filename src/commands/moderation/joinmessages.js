/**
 * @file Moderation JoinMessagesCommand - Toggle whether Ribbon should send special greeting messages when members join  
 * **Aliases**: `jmt`, `joinmessagestoggle`
 * @module
 * @category moderation
 * @name joinmessages
 * @example joinmessages enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class JoinMessagesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'joinmessages',
      memberName: 'joinmessages',
      group: 'moderation',
      aliases: ['jmt', 'joinmessagestoggle'],
      description: 'Toggle whether Ribbon should send special greeting messages when members join',
      format: 'BooleanResolvable [Channel]',
      examples: ['joinmessages enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable join messages?',
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
          key: 'channel',
          prompt: 'In which channel should I greet people?',
          type: 'channel',
          default: 'off'
        }
      ],
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {channel, option}) {
    if (option && channel === 'off') {
      return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
    }

    startTyping(msg);
    const defRoleEmbed = new MessageEmbed(),
      description = option ? '📈 Ribbon join messages have been enabled' : '📈 Ribbon join messages have been disabled',
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    msg.guild.settings.set('joinmsgs', option);
    msg.guild.settings.set('joinmsgchannel', channel.id);

    defRoleEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** ${description}
        ${option ? `**Channel:** <#${channel.id}>` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                      (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                      This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: defRoleEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(defRoleEmbed);
  }
};