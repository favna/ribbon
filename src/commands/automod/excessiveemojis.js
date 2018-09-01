/**
 * @file Automod ExcessiveEmojisCommand - Toggle the excessive emojis filter  
 * **Aliases**: `ef`, `emojifilter`, `spammedemojis`, `manyemojis`
 * @module
 * @category automod
 * @name excessiveemojis
 * @example excessiveemojis enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Excessive Emojis filter confirmation log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ExcessiveEmojisCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'excessiveemojis',
      memberName: 'excessiveemojis',
      group: 'automod',
      aliases: ['ef', 'emojifilter', 'spammedemojis', 'manyemojis'],
      description: 'Toggle the excessive emojis filter',
      format: 'BooleanResolvable',
      examples: ['excessiveemojis enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable the Excessive Emojis filter?',
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
          key: 'threshold',
          prompt: 'How many emojis are allowed in 1 message?',
          type: 'integer',
          default: 5
        },
        {
          key: 'minlength',
          prompt: 'What should the minimum length of a message be before it is checked?',
          type: 'integer',
          default: 10
        }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {option, threshold, minlength}) {
    startTyping(msg);

    const dtfEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        threshold,
        minlength
      };

    msg.guild.settings.set('emojis', options);

    dtfEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Excessive Emojis filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Threshold:** Messages that have at least ${threshold} emojis will be deleted` : ''}
      ${option ? `**Minimum length:** Messages of at least ${minlength} are checked for excessive emojis` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: dtfEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(dtfEmbed);
  }
};