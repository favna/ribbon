/**
 * @file Extra Time - Gets the current time in any place
 *
 * Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city
 *     or even as exact as a street.
 *
 * **Aliases**: `citytime`
 * @module
 * @category extra
 * @name time
 * @example time Amsterdam
 * @param {string} Location Place where you want to get the current time for
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import { stripIndents } from 'common-tags';
import fetch from 'node-fetch';

export default class TimeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'time',
            aliases: ['citytime'],
            group: 'extra',
            memberName: 'time',
            description: 'Gets the time in any given city',
            format: 'CityName',
            examples: ['time London'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'location',
                    prompt: 'For which location do you want to know the current time?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { location }: { location: string }) {
        try {
            const cords = await this.getCords(location);
            const res = await fetch(
                `http://api.timezonedb.com/v2/get-time-zone?${stringify({
                    by: 'position',
                    format: 'json',
                    key: process.env.TIMEZONE_DB_API_KEY!,
                    lat: cords.lat,
                    lng: cords.long,
                })}`
            );
            const time = await res.json();
            const timeEmbed = new MessageEmbed();

            timeEmbed
                .setTitle(`:flag_${time.countryCode.toLowerCase()}: ${cords.address}`)
                .setDescription(stripIndents`
                    **Current Time:** ${time.formatted.split(' ')[1]}
				    **Current Date:** ${time.formatted.split(' ')[0]}
					**Country:** ${time.countryName}
					**DST:** ${time.dst}`
                )
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR);

            deleteCommandMessages(msg, this.client);

            return msg.embed(timeEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(
                `I wasn't able to find a location for \`${location}\``
            );
        }
    }

    private async getCords (location: string) {
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?${stringify({
                address: location,
                key: process.env.GOOGLE_API_KEY!,
            })}`
        );
        const cords = await res.json();

        return {
            address: cords.results[0].formatted_address,
            lat: cords.results[0].geometry.location.lat,
            long: cords.results[0].geometry.location.lng,
        };
    }
}
