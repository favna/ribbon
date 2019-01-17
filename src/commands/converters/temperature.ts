/**
 * @file Converters TemperatureCommand - Convert various units of temperature
 *
 * **Aliases**: `heat`, `warmth`, `temp`
 * @module
 * @category converters
 * @name temperature
 * @example temperature 20 c f
 * @param {number} AmountToConvert The amount of something to convert
 * @param {string} FromUnit The unit to convert from
 * @param {string} ToUnit The unit to convert to
 */

import { convert } from 'awesome-converter';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping, TemperatureUnits } from '../../components';

export default class TemperatureCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'temperature',
            aliases: ['heat', 'warmth', 'temp'],
            group: 'converters',
            memberName: 'temperature',
            description: 'Convert various units of temperature',
            format: 'AmountToConvert FromUnit ToUnit',
            examples: ['temperature 20 c f', 'temperature 300 kelvin celsius'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'lengthAmount',
                    prompt: 'How much temperature to convert?',
                    type: 'integer',
                },
                {
                    key: 'fromUnit',
                    prompt: 'From what unit to convert?',
                    type: 'temperature',
                },
                {
                    key: 'toUnit',
                    prompt: 'To what unit to convert?',
                    type: 'temperature',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { lengthAmount, fromUnit, toUnit }: { lengthAmount: number, fromUnit: TemperatureUnits, toUnit: TemperatureUnits }) {
        try {
            startTyping(msg);
            const mathEmbed = new MessageEmbed();
            const output = convert(lengthAmount, TemperatureUnits[fromUnit], TemperatureUnits[toUnit]);

            mathEmbed
                .setTitle('Temperature Conversion')
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setDescription(oneLine`${lengthAmount} ${fromUnit} equals to ${output} ${toUnit}`);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(mathEmbed);
        } catch (err) {
            stopTyping(msg);

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`length\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Amount:** \`${lengthAmount}\`
                **From Unit:** \`${fromUnit}\`
                **To Unit:** \`${toUnit}\`
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
