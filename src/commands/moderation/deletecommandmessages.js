/**
 * @file Moderation deleteCommandMessagesCommand - Configure whether Ribbon should delete command messages  
 * **Aliases**: `dcm`
 * @module
 * @category moderation
 * @name deletecommandmessages
 * @example deletecommandmessages enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} DeleteCommandMessages confirmation log
 */

import {Command} from 'discord.js-commando'; 
import {MessageEmbed} from 'discord.js'; 
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class deleteCommandMessagesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'deletecommandmessages',
      memberName: 'deletecommandmessages',
      group: 'moderation',
      aliases: ['dcm'],
      description: 'Configure whether Ribbon should delete command messages',
      format: 'BooleanResolvable',
      examples: ['deletecommandmessages enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable deleting of command messages?',
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
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {option}) {
    startTyping(msg);

    const dcmEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    msg.guild.settings.set('deletecommandmessages', option);

    dcmEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(oneLine`**Action:** Deleting of command messages is now ${option ? 'enabled' : 'disabled'}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
              (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
              This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: dcmEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(dcmEmbed);
  }
};