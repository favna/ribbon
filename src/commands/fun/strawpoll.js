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
	strawpoll = require('strawpoll.js');

module.exports = class strawpollCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'strawpoll',
			'memberName': 'strawpoll',
			'group': 'fun',
			'aliases': ['poll', 'straw'],
			'description': 'Strawpoll something. Recommended to use the replying with each argument method to allow spaces in the title',
			'format': 'TitleOfStrawpoll OptionA|OptionB|OptionC...',
			'examples': ['strawpoll "Best Anime Waifu?" "Pyrrha Nikos|Ruby Rose"'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'title',
					'prompt': 'Title of the strawpoll',
					'type': 'string',
					'wait': 60
				},
				{
					'key': 'options',
					'prompt': 'Options for the strawpoll?',
					'type': 'string',
					'wait': 60,
					'validate': (opts) => {
						if (/([a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\\\,\<\.\>\/\?\`\~ ]*\|[a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\\\,\<\.\>\/\?\`\~]*)*/.test(opts) &&
							opts.split('|').length >= 2) {
							return true;
						}

						return 'You need at least 2 options and the valid format for the options is `Question 1|Question 2|Question 3 etc..`';
					}
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	async run (msg, args) {
		const APIConvertion = {
				'dupcheck': {
					'normal': 'IP Duplication Checking',
					'permissive': 'Browser Cookie Duplication Checking',
					'disabled': 'No Duplication Checking'
				},
				'multi': {
					'true': 'Multiple poll answers allowed',
					'false': 'Multiple poll answers disabled'
				}
			},
			poll = await strawpoll.make({
				'title': args.title,
				'options': args.options.split('|'),
				'multi': false,
				'dupcheck': 'normal',
				'captcha': false
			}),
			pollEmbed = new Discord.MessageEmbed();

		if (poll) {
			pollEmbed
				.setColor(msg.member !== null ? msg.member.displayHexColor : '#FF0000')
				.setTitle(poll.title)
				.setURL(`http://www.strawpoll.me/${poll.id}`)
				.setImage(`http://www.strawpoll.me/images/poll-results/${poll.id}.png`)
				.addField('Duplication Check', APIConvertion.dupcheck[poll.dupcheck], true)
				.addField('Multiple poll answers', APIConvertion.multi[poll.multi], true)
				.addField('Poll options', poll.options, false);

			this.deleteCommandMessages(msg);

			return msg.embed(pollEmbed, `http://www.strawpoll.me/${poll.id}`);
		}

		return msg.reply('⚠️ an error occured creating the strawpoll');
	}
};