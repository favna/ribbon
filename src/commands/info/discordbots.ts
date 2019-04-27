/**
 * @file Info DiscordBotsCommand - Gets the stats from a bot listed on DiscordBotList
 *
 * **Aliases**: `dbapi`, `db`
 * @module
 * @category info
 * @name discordbots
 * @example discordbots 512150391471996930
 * @param {string} [BotID] the user ID of the bot you want to get info about
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import moment from 'moment';
import fetch from 'node-fetch';

export default class DiscordBotsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'discordbots',
            aliases: ['dbapi', 'db'],
            group: 'info',
            memberName: 'discordbots',
            description: 'Gets the stats from a Discord Bot on DiscordBotList',
            format: 'DiscordBotID',
            examples: ['discordbots 512150391471996930'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'bot',
                    prompt: 'ID of the bot to get stats from?',
                    type: 'string',
                    default: '512150391471996930',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { bot }: { bot: string }) {
        try {
            const res = await fetch(`https://discordbots.org/api/bots/${bot}`, {
                headers: { Authorization: process.env.DISCORD_BOTS_API_KEY! },
            });
            const info = await res.json();
            const infoEmbed = new MessageEmbed();

            infoEmbed
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setTitle(`Discord Bots Info for ${info.username}#${info.discriminator} (${info.clientid})`)
                .setURL(`https://discordbots.org/bot/${info.clientid}`)
                .setThumbnail(`https://images.discordapp.net/avatars/${info.clientid}/${info.avatar}.png`)
                .setDescription(info.shortdesc)
                .setFooter(`${info.username}#${info.discriminator} was submitted`)
                .setTimestamp(moment(info.date).toDate())
                .addField('Default Prefix', info.prefix, true)
                .addField('Library', info.lib, true)
                .addField('Server Count', info.server_count, true)
                .addField('Shards Count', info.shards.length, true)
                .addField('Invite Link', `[Click Here](${info.invite})`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(infoEmbed, `https://discordbots.org/bot/${info.clientid}`);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply('an error occurred getting info from that bot, are you sure it exists on the website?');
        }
    }
}
