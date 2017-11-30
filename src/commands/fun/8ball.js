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
	predict = require('eightball');
    
module.exports = class eightBallCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': '8ball',
			'group': 'fun',
			'aliases': ['eightball'],
			'memberName': '8ball',
			'description': 'Roll a magic 8ball',
			'examples': ['8ball {question}', '8ball is Favna a genius coder?'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'question',
					'prompt': '8ball what?',
					'type': 'string',
					'label': 'Question to ask 8ball'
				}
			]
		});
	}

	run (msg, args) {
		const eightBallEmbed = new Discord.MessageEmbed();

		eightBallEmbed
			.setColor('#71CD40')
			.addField(':question: Question', args.question, false)
			.addField(':8ball: 8ball', predict(), false);
		
		return msg.embed(eightBallEmbed);
	}
};