/**
 * @file Converters LengthCommand - Convert various units of length
 *
 * **Aliases**: `weight`
 * @module
 * @category converters
 * @name length
 * @example length 1 gram pound
 * @param {number} AmountToConvert The amount of something to convert
 * @param {string} FromUnit The unit to convert from
 * @param {string} ToUnit The unit to convert to
 */


import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { convert } from 'awesome-converter';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, LengthUnits, startTyping, stopTyping } from '../../components';

export default class LengthCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'length',
            aliases: ['height'],
            group: 'converters',
            memberName: 'length',
            description: 'Convert various units of length',
            format: 'AmountToConvert FromUnit ToUnit',
            examples: ['length 1 m foot', 'length 170 cm inch'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'lengthAmount',
                    prompt: 'How much length to convert?',
                    type: 'integer',
                },
                {
                    key: 'fromUnit',
                    prompt: 'From what unit to convert?',
                    type: 'length',
                },
                {
                    key: 'toUnit',
                    prompt: 'To what unit to convert?',
                    type: 'length',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { lengthAmount, fromUnit, toUnit }: { lengthAmount: number, fromUnit: LengthUnits, toUnit: LengthUnits }) {
        try {
            startTyping(msg);
            const mathEmbed = new MessageEmbed();
            const output = convert(lengthAmount, LengthUnits[fromUnit], LengthUnits[toUnit]);

            mathEmbed
                .setTitle('Length Conversion')
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

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
