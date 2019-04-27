/**
 * @file Converters MassCommand - Convert various units of mass
 *
 * **Aliases**: `height`
 * @module
 * @category converters
 * @name length
 * @example length 1.7m f
 * @param {number} AmountToConvert The amount of something to convert
 * @param {string} FromUnit The unit to convert from
 * @param {string} ToUnit The unit to convert to
 */


import { DEFAULT_EMBED_COLOR, MassUnits } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { convert } from 'awesome-converter';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

export default class MassCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'mass',
            aliases: ['weight'],
            group: 'converters',
            memberName: 'mass',
            description: 'Convert various units of mass',
            format: 'AmountToConvert FromUnit ToUnit',
            examples: ['mass 1 g lb', 'mass 1 kg oz'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'massAmount',
                    prompt: 'How much mass to convert?',
                    type: 'float',
                },
                {
                    key: 'fromUnit',
                    prompt: 'From what unit to convert?',
                    type: 'mass',
                },
                {
                    key: 'toUnit',
                    prompt: 'To what unit to convert?',
                    type: 'mass',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { massAmount, fromUnit, toUnit }: { massAmount: number, fromUnit: MassUnits, toUnit: MassUnits }) {
        try {
            massAmount = roundNumber(massAmount, 2);
            const mathEmbed = new MessageEmbed();
            const output = convert(massAmount, MassUnits[fromUnit], MassUnits[toUnit], { precision: 2 });

            mathEmbed
                .setTitle('Mass Conversion')
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setDescription(oneLine`${massAmount} ${fromUnit} equals to ${output} ${toUnit}`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(mathEmbed);
        } catch (err) {
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`mass\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Amount:** \`${massAmount}\`
                **From Unit:** \`${fromUnit}\`
                **To Unit:** \`${toUnit}\`
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
