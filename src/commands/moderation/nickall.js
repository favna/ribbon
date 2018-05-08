/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Moderation NickallCommand - Assign a nickname to every member on the server  
 * Use `clear` to remove all nicknames  
 * Use `prefix` to prefix all names with something  
 * Use `append` to append all names with something  
 * Note that if there are a lot of members on the server it will take a long time to nickname them all due to Discord limiting the amount of actions per minute  
 * **Aliases**: `na`, `massnick`, `nickmass`, `allnick`
 * @module
 * @category moderation
 * @name nickall
 * @example nickall prefix ༼ つ ◕_◕ ༽つ  
 * -OR-  
 * nickall append ( ͡° ͜ʖ ͡°)  
 * -OR-  
 * nickall clear  
 * -OR-  
 * nickall Ribbon
 * @param {string} Nickname Nickname to assign
 * @returns {MessageEmbed} Log of the nicknaming
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class NickallCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nickall',
      memberName: 'nickall',
      aliases: ['na', 'massnick', 'nickmass', 'allnick'],
      group: 'moderation',
      description: 'Modify the nickname for all members of the guild',
      details: stripIndents`${oneLine`Assign, remove, prefix/append with a nickname to all members. 
                                Use \`clear\` as argument to remove the nickname, 
                                \`prefix\` to add a prefix to every member (takes their current nickname if they have one or their username if they do not), 
								\`append\` to do the same but append it instead of prefix`}
						**Please note that on larger servers this command can take a very long time to actually nickname all the members because Discord only allows a couple of actions per minute.**`,
      format: '[prefix|append] NewNickname|clear',
      examples: ['nickall AverageJoe', 'nickall prefix ༼ つ ◕_◕ ༽つ'],
      guildOnly: true,
      args: [
        {
          key: 'data',
          prompt: 'What nickname to assign? Check the details through the `help nickall` command to see all options',
          type: 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES');
  }

  run (msg, args) {
    startTyping(msg);
    const allMembers = msg.guild.members.values(),
      argData = args.data.split(' '),
      modLogs = this.client.provider.get(msg.guild, 'modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      nickallLogembed = new MessageEmbed();

    nickallLogembed
      .setColor('#355698')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setTimestamp();

    if (argData[0] === 'clear') {
      for (const member of allMembers) {
        if (member.manageable) {
          member.setNickname('');
        }
      }
      nickallLogembed.setDescription('**Action:** Removed the nicknames from all members');
    } else if (argData[0] === 'prefix') {
      for (const member of allMembers) {
        if (member.manageable) {
          member.setNickname(`${argData.slice(1).join(' ')} ${member.displayName}`);
        }
      }
      nickallLogembed.setDescription(`**Action:** Prefix the name of every member with ${argData.slice(1).join(' ')}`);
    } else if (argData[0] === 'append') {
      for (const member of allMembers) {
        if (member.manageable) {
          member.setNickname(`${member.displayName} ${argData.slice(1).join(' ')}`);
        }
      }
      nickallLogembed.setDescription(`**Action:** Appended the name of every member with ${argData.slice(1).join(' ')}`);
    } else {
      for (const member of allMembers) {
        if (member.manageable) {
          member.setNickname(args.data);
        }
      }
      nickallLogembed.setDescription(`**Action:** Assigned the nickname ${args.data} to all members`);
    }

    if (this.client.provider.get(msg.guild, 'modlogs', true)) {
      if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
      }

      modLogs ? msg.guild.channels.get(modLogs).send('', {embed: nickallLogembed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(nickallLogembed);
  }
};