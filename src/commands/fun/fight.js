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
	random = require('node-random');

module.exports = class fightCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'fight',
			'memberName': 'fight',
			'group': 'fun',
			'aliases': ['combat'],
			'description': 'Pit two things against each other in a fight to the death',
			'format': 'FirstFighter, SecondFighter',
			'examples': ['fight Favna Chuck Norris'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'fighterOne',
					'prompt': 'Who or what is the first fighter?',
					'type': 'string'
				},
				{
					'key': 'fighterTwo',
					'prompt': 'What or what is the second fighter?',
					'type': 'string'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		const fighterEmbed = new Discord.MessageEmbed();

		fighterEmbed
			.setColor('#E24141')
			.setTitle('🥊 Fight Results 🥊')
			.setThumbnail('http://i.imgur.com/LxPAE2f.png');

		if (args.fighterOne.toLowerCase() === 'chuck norris' || args.fighterTwo.toLowerCase() === 'chuck norris') {
			if (args.fighterOne.toLowerCase() === 'favna' || args.fighterTwo.toLowerCase() === 'favna') {
				fighterEmbed
					.addField('All right, you asked for it...', '***The universe was destroyed due to this battle between two unstoppable forces. Good Job.***')
					.setImage('https://i.imgur.com/Witob4j.png');
			} else {
				fighterEmbed
					.addField('You fokn wot m8', '***Chuck Norris cannot be beaten***')
					.setImage('https://i.imgur.com/WCFyXRr.png');
			}

			this.deleteCommandMessages(msg);

			return msg.embed(fighterEmbed);
		}
		if (args.fighterOne.toLowerCase() === 'favna' || args.fighterTwo.toLowerCase() === 'favna') {
			fighterEmbed
				.addField('You got mega rekt', '***Favna always wins***')
				.setImage('https://i.imgur.com/XRsLP7Q.gif');

			this.deleteCommandMessages(msg);

			return msg.embed(fighterEmbed);
		}
		random.integers({'number': 2}, (error, data) => {
			if (!error) {
				const fighterOneChance = parseInt(data[0], 10),
					fighterTwoChance = parseInt(data[1], 10),
					loser = Math.min(fighterOneChance, fighterTwoChance) === fighterOneChance ? args.fighterOne : args.fighterTwo,
					winner = Math.max(fighterOneChance, fighterTwoChance) === fighterOneChance ? args.fighterOne : args.fighterTwo;

				fighterEmbed
					.addField('🇼 Winner', `**${winner}**`, true)
					.addField('🇱 Loser', `**${loser}**`, true)
					.setFooter(`${winner} bodied ${loser} on ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`);

				this.deleteCommandMessages(msg);

				return msg.embed(fighterEmbed);
			}

			this.deleteCommandMessages(msg);

			return msg.reply('⚠️ an error occured pitting these combatants against each other 😦');
		});
		
		return null;
	}
};