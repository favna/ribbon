/**
 * @file Leaderboards PubgCommand - Get statistics from a PUBG account
 * @module
 * @category leaderboards
 * @name pubg
 * @example pubg shroud pc-na
 * @param {string} PubgUsername The username you want to find statistics for
 * @param {string} Shard A combination of platform and region to look through, for example `pc-na` for PC in
 *     North America
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, pubgRegionsMap } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

export default class PubgCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'pubg',
            group: 'leaderboards',
            memberName: 'pubg',
            description: 'Get statistics from a PUBG account',
            format: 'PubgUsername Shard',
            examples: ['pubg shroud pc-na'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'user',
                    prompt: 'What is the username to find data for?',
                    type: 'string',
                },
                {
                    key: 'shard',
                    prompt: stripIndents`
                                Which platform and region is the player in? Must be one of:

                                ${pubgRegionsMap.join('\n')}
                            `,
                    type: 'string',
                    validate: (region: string) => /(xbox-as|xbox-eu|xbox-na|xbox-oc|pc-krjp|pc-jp|pc-na|pc-eu|pc-ru|pc-oc|pc-kakao|pc-sea|pc-sa|pc-as)/im.test(region)
                        ? true
                        : stripIndents`
                            Has to be one of the following platform-region identifiers:

                            ${pubgRegionsMap.join('\n')}
                        `,
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { user, shard }: { user: string; shard: string }) {
        try {
            startTyping(msg);

            const pubEmbed = new MessageEmbed();
            const headers = { Accept: 'application/vnd.api+json', Authorization: `Bearer ${process.env.PUBG_API_KEY!}` };

            const seasonReq = await fetch(`https://api.pubg.com/shards/${shard}/seasons`, { headers });
            const seasons = await seasonReq.json();
            const currentSeason = seasons.data.filter((season: any) => season.attributes.isCurrentSeason)[0].id;

            const playerReq = await fetch(`https://api.pubg.com/shards/${shard}/players?filter[playerNames]=${user}`, { headers });
            const players = await playerReq.json();
            const playerId = players.data[0].id;
            const playerName = players.data[0].attributes.name;

            const playerStatsReq = await fetch(`https://api.pubg.com/shards/${shard}/players/${playerId}/seasons/${currentSeason}`, { headers });
            const playerStats = await playerStatsReq.json();

            pubEmbed
                .setTitle(`PUBG Player Statistics for ${playerName}`)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/pubgicon.png`)
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .addField(
                    'Duos Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats.duo.wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats.duo.losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats.duo.assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats.duo.kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats.duo.headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats.duo.roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats.duo.maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats.duo.suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats.duo.weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats.duo.rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats.duo.walkDistance}**
                    `,
                    true
                )
                .addField(
                    'Duos FPP Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats['duo-fpp'].wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats['duo-fpp'].losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats['duo-fpp'].assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats['duo-fpp'].kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats['duo-fpp'].headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats['duo-fpp'].roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats['duo-fpp'].maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats['duo-fpp'].suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats['duo-fpp'].weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats['duo-fpp'].rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats['duo-fpp'].walkDistance}**
                    `,
                    true
                )
                .addField(
                    'Solos Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats.solo.wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats.solo.losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats.solo.assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats.solo.kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats.solo.headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats.solo.roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats.solo.maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats.solo.suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats.solo.weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats.solo.rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats.solo.walkDistance}**
                    `,
                    true
                )
                .addField(
                    'Solos FPP Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats['solo-fpp'].wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats['solo-fpp'].losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats['solo-fpp'].assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats['solo-fpp'].kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats['solo-fpp'].headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats['solo-fpp'].roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats['solo-fpp'].maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats['solo-fpp'].suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats['solo-fpp'].weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats['solo-fpp'].rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats['solo-fpp'].walkDistance}**
                    `,
                    true
                )
                .addField(
                    'Squad Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats.squad.wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats.squad.losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats.squad.assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats.squad.kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats.squad.headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats.squad.roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats.squad.maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats.squad.suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats.squad.weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats.squad.rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats.squad.walkDistance}**
                    `,
                    true
                )
                .addField(
                    'Squad FPP Stats',
                    stripIndents`
                        Wins: **${playerStats.data.attributes.gameModeStats['squad-fpp'].wins}**
                        Losses: **${playerStats.data.attributes.gameModeStats['squad-fpp'].losses}**
                        Assists: **${playerStats.data.attributes.gameModeStats['squad-fpp'].assists}**
                        Kills: **${playerStats.data.attributes.gameModeStats['squad-fpp'].kills}**
                        Headshot Kills: **${playerStats.data.attributes.gameModeStats['squad-fpp'].headshotKills}**
                        Road Kills: **${playerStats.data.attributes.gameModeStats['squad-fpp'].roadKills}**
                        Longest Kill Streak: **${playerStats.data.attributes.gameModeStats['squad-fpp'].maxKillStreaks}**
                        Suicides: **${playerStats.data.attributes.gameModeStats['squad-fpp'].suicides}**
                        Weapons Acquired: **${playerStats.data.attributes.gameModeStats['squad-fpp'].weaponsAcquired}**
                        Drive Distance: **${playerStats.data.attributes.gameModeStats['squad-fpp'].rideDistance}**
                        Walk Distance: **${playerStats.data.attributes.gameModeStats['squad-fpp'].walkDistance}**
                    `,
                    true
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(pubEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            if (/(?:Cannot read property)/i.test(err.toString())) {
                return msg.reply(
                    `no player found with username \`${user}\` in \`${shard}\``
                );
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`pubg\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **User:** ${user}
                **Shard:** ${shard}
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
