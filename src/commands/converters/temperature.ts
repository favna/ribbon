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

import { DEFAULT_EMBED_COLOR, TemperatureUnit } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { convert } from 'awesome-converter';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type TemperatureArgs = {
    tempAmount: number;
    fromUnit: TemperatureUnit;
    toUnit: TemperatureUnit;
};

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
                    key: 'tempAmount',
                    prompt: 'How much temperature to convert?',
                    type: 'float',
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

    public async run (msg: CommandoMessage, { tempAmount, fromUnit, toUnit }: TemperatureArgs) {
        try {
            tempAmount = roundNumber(tempAmount, 2);
            const mathEmbed = new MessageEmbed();
            const output = convert(tempAmount, TemperatureUnit[fromUnit], TemperatureUnit[toUnit], { precision: 2 });

            mathEmbed
                .setTitle('Temperature Conversion')
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setDescription(oneLine`${tempAmount} ${fromUnit} equals to ${output} ${toUnit}`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(mathEmbed);
        } catch (err) {
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`length\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Amount:** \`${tempAmount}\`
                **From Unit:** \`${fromUnit}\`
                **To Unit:** \`${toUnit}\`
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
