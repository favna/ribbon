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
 * Generates a QR code from text (like a URL)  
 * **Aliases**: `qr`
 * @module
 * @category utility
 * @name qrgen
 * @example qrgen https://favna.xyz/ribbon
 * @param {string} URL URL you want to encode into a QR image
 * @returns {MessageEmbed} Embedded QR code and original image URL
 */

const commando = require('discord.js-commando'),
	imgur = require('imgur'),
	qr = require('qrcode'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class qrgenCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'qrgen',
			'memberName': 'qrgen',
			'group': 'utility',
			'aliases': ['qr'],
			'description': 'Generates a QR code from a given string',
			'format': 'URLToConvert',
			'examples': ['qrgen https://github.com/Favna/Ribbon'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'url',
					'prompt': 'String (URL) to make a QR code for?',
					'type': 'string'
				}
			]
		});
	}

	async run (msg, args) {
		const base64 = await qr.toDataURL(args.url, {'errorCorrectionLevel': 'M'});

		if (base64) {
			const upload = await imgur.uploadBase64(base64.slice(22));

			if (upload) {
				deleteCommandMessages(msg, this.client);

				return msg.say(`QR Code for this URL: ${upload.data.link}`);
			}

			return msg.reply('⚠️ An error occured uploading the QR code to imgur.');
		}

		return msg.reply('⚠️ An error occured getting a base64 image for that URL.');
	}
};