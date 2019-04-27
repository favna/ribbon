/**
 * @file Extra Weather - Get the current weather forecast in any city
 *
 * Potentially you'll have to specify city if the city is in multiple countries, i.e. `weather amsterdam` will not be
 *     the same as `weather amsterdam missouri`
 *
 * Uses Google's Geocoding to determine the correct location therefore supports any location indication, country, city
 *     or even as exact as a street.
 *
 * **Aliases**: `temp`, `forecast`, `fc`, `wth`
 * @module
 * @category extra
 * @name weather
 * @example weather Amsterdam
 * @param {string} CityName Name of the city to get the weather forecast for
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

export default class WeatherCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'weather',
            aliases: ['forecast', 'fc', 'wth'],
            group: 'extra',
            memberName: 'weather',
            description: 'Get the weather in a city',
            format: 'CityName',
            details: stripIndents`
                ${oneLine`Potentially you'll have to specify city if the city is in multiple countries, i.e.
                    \`weather amsterdam\` will not be the same as \`weather amsterdam missouri\``}
                ${oneLine`Uses Google's Geocoding to determine the correct location therefore supports any location
                    indication, country, city or even as exact as a street.`}`,
            examples: ['weather amsterdam'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'location',
                    prompt: 'For which location do you want to know the weather forecast?',
                    type: 'string',
                }
            ],
        });
    }

    private static mileify (speed: number) {
        return speed * 0.6214;
    }

    private static async getCords (location: string) {
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

    private static fahrenify (temp: number) {
        return temp * 1.8 + 32;
    }

    public async run (msg: CommandoMessage, { location }: { location: string }) {
        try {
            startTyping(msg);
            const cords = await WeatherCommand.getCords(location);
            const res = await fetch(
                `https://api.darksky.net/forecast/${
                    process.env.DARK_SKY_API_KEY!
                    }/${cords.lat},${cords.long}?${stringify({
                    exclude: ['minutely', 'hourly', 'alerts', 'flags'],
                    units: 'si',
                })}`
            );
            const weather = await res.json();
            const weatherEmbed = new MessageEmbed();

            weatherEmbed
                .setTitle(`Weather forecast for ${cords.address}`)
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setFooter('Powered by DarkSky')
                .setTimestamp()
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/weather/${weather.currently.icon}.png`)
                .setDescription(weather.daily.summary)
                .addField(
                    '<:windspeed:513156337237098521> Wind Speed',
                    `${weather.currently.windSpeed} km/h (${roundNumber(
                        WeatherCommand.mileify(weather.currently.windSpeed),
                        2
                    )} mph)`,
                    true
                )
                .addField(
                    '<:humidity:513156336997892121> Humidity',
                    `${weather.currently.humidity * 100}%`,
                    true
                )
                .addField(
                    '<:sunrise:513156337325047835> Sunrise',
                    moment(weather.daily.data[0].sunriseTime * 1000).format(
                        'HH:mm'
                    ),
                    true
                )
                .addField(
                    '<:sunset:513156337287299072> Sunset',
                    moment(weather.daily.data[0].sunsetTime * 1000).format(
                        'HH:mm'
                    ),
                    true
                )
                .addField(
                    '<:todayhigh:513156337379704832> Today\'s High',
                    `${weather.daily.data[0].temperatureHigh} °C | ${roundNumber(
                        WeatherCommand.fahrenify(weather.daily.data[0].temperatureHigh),
                        2
                    )} °F`,
                    true
                )
                .addField(
                    '<:todaylow:513156337732157440> Today\'s Low',
                    `${weather.daily.data[0].temperatureLow} °C | ${roundNumber(
                        WeatherCommand.fahrenify(weather.daily.data[0].temperatureLow),
                        2
                    )} °F`,
                    true
                )
                .addField(
                    '<:temperature:513156336964337697> Temperature',
                    `${weather.currently.temperature} °C | ${roundNumber(
                        WeatherCommand.fahrenify(weather.currently.temperature),
                        2
                    )} °F`,
                    true
                )
                .addField(
                    '<:feelslike:513156337975164928> Feels Like',
                    `${weather.currently.apparentTemperature} °C | ${roundNumber(
                        WeatherCommand.fahrenify(weather.currently.apparentTemperature),
                        2
                    )} °F`,
                    true
                )
                .addField(
                    '<:condition:513156337220190209> Condition',
                    weather.daily.data[0].summary,
                    true
                )
                .addField(
                    `<:forecast:513156337321115667> Forecast ${moment.unix(weather.daily.data[1].time).format('dddd MMMM Do')}`,
                    oneLine`High: ${weather.daily.data[1].temperatureHigh} °C (${roundNumber(WeatherCommand.fahrenify(weather.daily.data[1].temperatureHigh), 2)} °F)
                          | Low: ${weather.daily.data[1].temperatureLow} °C (${roundNumber(WeatherCommand.fahrenify(weather.daily.data[1].temperatureLow), 2)} °F)`,
                    false
                )
                .addField(
                    `<:forecast:513156337321115667> Forecast ${moment.unix(weather.daily.data[2].time).format('dddd MMMM Do')}`,
                    oneLine`High: ${weather.daily.data[2].temperatureHigh} °C (${roundNumber(WeatherCommand.fahrenify(weather.daily.data[2].temperatureHigh), 2)} °F)
                          | Low: ${weather.daily.data[2].temperatureLow} °C (${roundNumber(WeatherCommand.fahrenify(weather.daily.data[2].temperatureLow), 2)} °F)`,
                    false
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(weatherEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            return msg.reply(`I wasn't able to find a location for \`${location}\``);
        }
    }
}
