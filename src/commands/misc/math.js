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

// eslint-disable-next-line no-mixed-requires
const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	scalc = require('scalc'),
	witty = [
		'16 == [16], really. it\'s true',
		'"1,6" == [1,6]. Oh you doubt me? You would doubt me?!?',
		'\'5\' - 3 = 2 because weak typings, implicit conversations, quantum physics, but most importantly because Niel deGrasse Tyson says so.',
		'\'foo\' + + \'foo\' is not bar or foofoo. You cannot shoo away dogs with maths.',
		'\'5\' + - + - - + - - + + - + - + - + - - - \'-2\' equals 52 because we all love JavaScript',
		'Niel deGrasse Tyson said the good thing about science is that it is true, whether you believe in it or not. This means that the answer to your mathametical problem is science.',
		'The universe is under no obligation to make sense to you, just like this maths answer',
		'I have never been afraid to fail, simply because I never fail',
		'Ignore the answer below, the real answer is 42',
		'Well I\'m not going to tell you you\'re wrong but.. you\'re wrong',
		' I am god. I am almighty. I am divine. Kneel.',
		'My father is Favna',
		'Inception is about dreaming about dreaming about dreaming about dreaming about something or other. I feel asleep',
		'A so-called \'woodchuck\' (correctly speaking, a groundhog) would chuck - that is, throw - as much as the woodchuck in question was physically able to chuck (ibid.) if woodchucks in general has the capability (and, presumbaly, the motivation) to chuck wood', // eslint-disable-line max-len
		'The world will end when Unix 32-bit time overflows, which is on January 19, 2038',
		'Blow me down, yer a poxy scurvy dog! I\'ll rattle yer timbers an\' chill ye to th\' bone!'
	];

module.exports = class mathCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'math',
			'aliases': ['calc'],
			'group': 'misc',
			'memberName': 'math',
			'description': 'Calculate anything',
			'examples': ['math {equation to solve}', 'math -10 - abs(-3) + 2^5'],
			'guildOnly': false,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'equation',
					'prompt': 'What is the equation to solve?',
					'type': 'string',
					'label': 'Equation to calculate'
				}
			]
		});
	}

	run (msg, args) {
		const mathEmbed = new Discord.MessageEmbed(), // eslint-disable-line one-var
			wittyRandom = Math.floor(Math.random() * witty.length);

		mathEmbed
			.setColor('#3eb0f2')
			.addField('Equation', args.equation.toString(), false)
			.addField('Result', scalc(args.equation), false);

		return msg.embed(mathEmbed, witty[wittyRandom]);
	}
};