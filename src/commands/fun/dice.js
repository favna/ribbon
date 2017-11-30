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
	xdicey = require('xdicey');

module.exports = class diceCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'dice',
			'aliases': ['xdicey', 'roll', 'dicey', 'die'],
			'group': 'fun',
			'memberName': 'dice',
			'description': 'Sends contents of a copypasta file to the chat',
			'examples': ['dice <sides_on_die> <amount_of_rolls>', 'dice 6 5'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'sides',
					'prompt': 'How many sides does your die have?',
					'type': 'integer',
					'label': 'Amount of sides the dice have'
				}, {
					'key': 'rolls',
					'prompt': 'How many times should the die be rolled?',
					'type': 'integer',
					'label': 'The amount of times the die is rolled'
				}
			]
		});
	}

	run (msg, args) {
		const diceEmbed = new Discord.MessageEmbed(),
			res = [],
			throwDice = xdicey(args.rolls, args.sides);


		for (const i in throwDice.individual) { // eslint-disable-line guard-for-in
			res.push(`🎲: ${throwDice.individual[i]}`);
		}


		diceEmbed
			.setColor('#EA596E')
			.addField('Dice result', res, false)
			.addField('Total', throwDice.total, false);

		return msg.embed(diceEmbed);
	}
};