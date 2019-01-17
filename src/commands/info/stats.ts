/**
 * @file Info RibbonStatsCommand - Statistics about Ribbon
 *
 * **Aliases**: `botinfo`, `info`
 * @module
 * @category info
 * @name stats
 */

import { oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import 'moment-duration-format';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

/* tslint:disable-next-line:no-var-requires */
const speedTest = require('speedtest-net');

export default class RibbonStatsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'stats',
            aliases: ['botinfo', 'info'],
            group: 'info',
            memberName: 'stats',
            description: 'Gets statistics about Ribbon',
            examples: ['stats'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public async run (msg: CommandoMessage): Promise<any> {
        startTyping(msg);
        const speed = speedTest({
            maxTime: 5000,
            serverId: 3242,
        });
        const statsEmbed = new MessageEmbed();
        const fields = {
            info: {
                name: '\u200b',
                value: oneLine`
                    Use the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}
                    help\` command to get the list of commands available to you in a DM.
                    The default prefix is \`!\`. You can change this with the \`
                    ${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}
                    prefix\` command.
                    If you ever forget the command prefix, just use \`${this.client.user.tag} prefix\``,
            },
            time: {
                name: 'Current server time',
                value: moment().format('MMMM Do YYYY [|] HH:mm.ss [UTC]ZZ'),
            },
        };

        statsEmbed
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setAuthor(`${this.client.user.username} Stats`, this.client.user.displayAvatarURL({ format: 'png' }))
            .addField('Guilds', this.client.guilds.size, true)
            .addField('Channels', this.client.channels.size, true)
            .addField('Users', this.client.users.size, true)
            .addField('Owner', this.client.owners[0].tag, true)
            .addField('License', 'GPL-3.0', true)
            .addField('DiscordJS', 'master', true)
            .addField('NodeJS', process.version, true)
            .addField('Platform', this.fetchPlatform(process.platform.toLowerCase()), true)
            .addField('Memory Usage', `${roundNumber(process.memoryUsage().heapUsed / 10485.76) / 100} MB`, true)
            .addField('Invite Me', '[Click Here](https://favna.xyz/redirect/ribbon)', true)
            .addField('Source', '[Available on GitHub](https://github.com/favna/ribbon)', true)
            .addField('Support', '[Server Invite](https://favna.xyz/redirect/server)', true)
            .addField('Uptime', moment.duration(this.client.uptime).format('DD [days], HH [hours and] mm [minutes]'), true)
            .addField(fields.time.name, fields.time.value)
            .addField(fields.info.name, fields.info.value)
            .setFooter(`Ribbon | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`, this.client.user.displayAvatarURL({ format: 'png' }));

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        const statMessage: Message = await msg.embed(statsEmbed) as Message;

        speed.on('data', (data: any) => {
            statsEmbed.fields.pop();
            statsEmbed.fields.pop();
            statsEmbed
                .addField('Download Speed', `${roundNumber(data.speeds.download, 2)} Mbps`, true)
                .addField('Upload Speed', `${roundNumber(data.speeds.upload, 2)} Mbps`, true)
                .addField(fields.time.name, fields.time.value)
                .addField(fields.info.name, fields.info.value);

            statMessage.edit('', { embed: statsEmbed });
        });
    }

    private fetchPlatform (plat: string) {
        switch (plat) {
            case 'win32':
                return 'Windows';
            case 'darwin':
                return 'MacOS';
            default:
                return 'Linux';
        }
    }
}
