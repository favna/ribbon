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

const commando = require('discord.js-commando'),
	imgur = require('imgur'),
	qr = require('qrcode');


module.exports = class qrgenCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'qrgen',
			'aliases': ['qr'],
			'group': 'links',
			'memberName': 'qrgen',
			'description': 'Generates a QR code from a given string',
			'examples': ['qrgen {url}', 'qrgen https://ribbon.favna.xyz'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'qrurl',
					'prompt': 'String (URL) to make a QR code for?',
					'type': 'string',
					'label': 'URL to get a QR for'
				}
			]
		});
	}

	run (msg, args) {
		qr.toDataURL(args.qrurl, {'errorCorrectionLevel': 'M'}, (err, url) => {
			if (err) {
				throw err;
			}
			imgur.uploadBase64(url.slice(22))
				.then(json => msg.say(`QR Code for this file: ${json.data.link}`));
		});
	}
};