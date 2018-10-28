/**
 * @file Automod ExcessiveCapsCommand - Toggle the excessive caps filter  
 * **Aliases**: `spammedcaps`, `manycaps`, `caps`
 * @module
 * @category automod
 * @name excessivecaps
 * @example excessivecaps enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Excessive Caps filter confirmation log
 */

import {Command} from 'discord.js-commando'; 
import {MessageEmbed} from 'discord.js'; 
import {oneLine, stripIndents} from 'common-tags'; 
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class ExcessiveCapsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'excessivecaps',
      memberName: 'excessivecaps',
      group: 'automod',
      aliases: ['spammedcaps', 'manycaps', 'caps'],
      description: 'Toggle the excessive caps filter',
      format: 'BooleanResolvable',
      examples: ['excessivecaps enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable the Excessive Caps filter?',
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
          prompt: 'After how much percent of caps should a message be deleted?',
          type: 'string',
          default: '60',
          validate: (t) => {
            if ((/(?:[%])/).test(t)) {
              if (Number(t.slice(0, -1))) {
                return true;
              }
            } else if (Number(t)) {
              return true;
            }

            return 'has to be a valid percentile number in the format of `60% or `60`';
          }
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
    if ((/(?:[%])/).test(threshold)) {
      threshold = Number(threshold.slice(0, -1));
    } else {
      threshold = Number(threshold);
    }

    const ecfEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      options = {
        enabled: option,
        threshold,
        minlength
      };

    msg.guild.settings.set('caps', options);

    ecfEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Excessive Caps filter has been ${option ? 'enabled' : 'disabled'}
      ${option ? `**Threshold:** Messages that have at least ${threshold}% caps will be deleted` : ''}
      ${option ? `**Minimum length:** Messages of at least ${minlength} are checked for caps` : ''}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: ecfEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(ecfEmbed);
  }
};