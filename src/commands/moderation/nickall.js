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

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	{oneLine} = require('common-tags');

module.exports = class nickallCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'nickall',
			'aliases': ['na', 'massnick', 'nickmass', 'allnick'],
			'group': 'misc',
			'memberName': 'nickall',
			'description': 'Modify the nickname for all guildmembers',
			'details': oneLine `Assign, remove, prefix/append with a nickname to all members. 
                                Use \`clear\` as argument to remove the nickname, 
                                \`pattern prefix\` to add a prefix to every member (takes their current nickname if they have one or their username if they do not), 
                                \`pattern append\` to do the same but append it instead of prefix`,
			'examples': ['nickall {[pattern] [prefix/append] new_nickname}', 'nickall AverageJoe', 'nickall pattern prefix ༼ つ ◕_◕ ༽つ'],
			'guildOnly': true,

			'args': [
				{
					'key': 'data',
					'prompt': 'What nickname to assign?',
					'type': 'string',
					'label': 'nick to assign'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		const allMembers = msg.guild.members.values(),
			argData = args.data.split(' '),
			modLogs = this.client.provider.get(msg.guild, 'modlogchannel',
				msg.guild.channels.exists('name', 'mod-logs')
					? msg.guild.channels.find('name', 'mod-logs').id
					: null),
			nickAllEmbed = new Discord.MessageEmbed();

		nickAllEmbed
			.setColor('#E24141')
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setFooter(moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'));

		if (argData[0] === 'clear') {
			for (const member of allMembers) {
				member.setNickname('');
			}
			nickAllEmbed.setDescription('**Action:** Removed the nicknames from all members');
		} else if (argData[0] === 'prefix') {
			for (const member of allMembers) {
				member.setNickname(`${argData.slice(1).join(' ')} ${member.displayName}`);
			}
			nickAllEmbed.setDescription(`**Action:** Prefix the name of every member with ${argData.slice(1).join(' ')}`);
		} else if (argData[0] === 'append') {
			for (const member of allMembers) {
				member.setNickname(`${member.displayName} ${argData.slice(1).join(' ')}`);
			}
			nickAllEmbed.setDescription(`**Action:** Appended the name of every member with ${argData.slice(1).join(' ')}`);
		} else {
			for (const member of allMembers) {
				member.setNickname(args.data);
			}
			nickAllEmbed.setDescription(`**Action:** Assigned the nickname ${args.data} to all members`);
		}

		if (this.client.provider.get(msg.guild, 'modlogs', true)) {
			if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
				msg.reply(oneLine `📃 I can keep a log of mass nickname changes if you create a channel named \'mod-logs\'
        			(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
        			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
				this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
			}

			this.deleteCommandMessages(msg);

			return modLogs !== null ? msg.guild.channels.get(modLogs).send({nickAllEmbed}) : null;
		}

		this.deleteCommandMessages(msg);

		return msg.reply(nickAllEmbed.description.slice(12));
	}
};