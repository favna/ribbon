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

const commando = require('discord.js-commando');

const replaceAll = function (string, pattern, replacement) { // eslint-disable-line one-var
	return string.replace(new RegExp(pattern, 'g'), replacement);
};

module.exports = class lmgtfyCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'lmgtfy',
			'group': 'search',
			'aliases': ['dumb'],
			'memberName': 'lmgtfy',
			'description': 'Produce a lmgtfy (let me google that for you) URL',
			'examples': ['lmgtfy {query}', 'lmgtfy is it legal to kill an ant???', 'lmgtfy are there birds in canada?'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'question',
					'prompt': 'What does the idiot want to find?',
					'type': 'string',
					'label': 'Search query to lmgtfy'
				}
			]
		});
	}

	run (msg, args) {
		return msg.say(`https://lmgtfy.com/?q=${replaceAll(args.question, / /, '+')}`);
	}
};