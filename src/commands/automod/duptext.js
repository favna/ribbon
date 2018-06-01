/**
 * @file Automod DuplicateTextCommand - Toggle the duplicate text filter  
 * Uses the Levenshtein Distance Algorithm to determine similarity. If the distance is less than 10 the messages are considered duplicate.  
 * You can specify the minutes within messages should be checked (defaults to 3), the amount of allowed similar messages (defaults to 2) and the Levenshtein distance (defaults to 20)
 * **Aliases**: `duplicatefilter`, `duplicatetextfilter`, `dtf`
 * @module
 * @category automod
 * @name duptext
 * @example duptext enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Duplicate text filter confirmation log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class DuplicateTextCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'duptext',
      memberName: 'duptext',
      group: 'automod',
      aliases: ['duplicatefilter', 'duplicatetextfilter', 'dtf'],
      description: 'Toggle the duplicate text filter',
      details: stripIndents`
      Uses the Levenshtein Distance Algorithm to determine similarity. If the distance is less than 10 the messages are considered duplicate.
      You can specify the minutes within messages should be checked (defaults to 3), the amount of allowed similar messages (defaults to 2) and the Levenshtein distance (defaults to 20)`,
      format: 'BooleanResolvable',
      examples: ['duptext enable', 'duptext enable 3 2 20'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable the duplicate text filter?',
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
          key: 'within',
          prompt: 'Within how many minutes should duplicate messages be checked?',
          type: 'integer',
          default: 3
        },
        {
          key: 'equals',
          prompt: 'How many similar messages can a member send before any being deleted?',
          type: 'integer',
          default: 2
        },
        {
          key: 'distance',
          prompt: 'What is the levenshtein distance you want to use?',
          type: 'integer',
          default: 20
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  run (msg, {option, within, equals, distance}) {
    startTyping(msg);

    const dtfEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        within,
        equals,
        distance
      };

    msg.guild.settings.set('duptext', options);

    dtfEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Duplicate text filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Timeout:** Duplicate text is checked between messages sent in the past ${within} minutes` : ''}
      ${option ? `**Duplicates:** Members can send ${equals} duplicate messages before any others are deleted` : ''}
      ${option ? `**Distance:** Messages are deleted if they have a levenshtein distance of at least ${distance}` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: dtfEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(dtfEmbed);
  }
};