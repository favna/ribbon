/**
 * @file Moderation UnlockCommand - Unlock the channel  
 * Only really useful if you previously locked the channel  
 * Note that Ribbon does need to be able to be able to access this channel to unlock it (read permissions)  
 * **Aliases**: `delock`, `ul`
 * @module
 * @category moderation
 * @name unlock
 * @returns {Message} Confirmation the channel is unlocked
 */

import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class UnlockCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unlock',
      memberName: 'unlock',
      group: 'moderation',
      aliases: ['delock', 'ul'],
      description: 'Unlocks the current channel',
      examples: ['unlock'],
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
      ],
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {lockrole}) {
    startTyping(msg);
    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      overwrite = await msg.channel.overwritePermissions({
        overwrites: [
          {
            id: msg.guild.roles.find(n => lockrole === 'everyone' ? n.name === '@everyone' : n.name === lockrole.name).id,
            allowed: ['SEND_MESSAGES']
          }
        ],
        reason: 'Channel Lockdown'
      }),
      unlockEmbed = new MessageEmbed();

    unlockEmbed
      .setColor('#359876')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(oneLine`**Action:** 🔓 unlocked the \`${msg.channel.name}\` channel. 
				This channel can now be used by everyone again. Use \`${msg.guild.commandPrefix}lockdown\` in this channel to (re)-lock it.`)
      .setTimestamp();

    if (overwrite) {
      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                            (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                            This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }

        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: unlockEmbed}) : null;
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(unlockEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred unlocking this channel');
  }
};