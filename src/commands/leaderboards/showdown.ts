/**
 * @file Leaderboards ShowdownCommand - Show the top ranking players in your tier of choice
 *
 * **Aliases**: `showdownlb`, `pokelb`
 * @module
 * @category leaderboards
 * @name showdown
 * @example showdown ou
 * @param {StringResolvable} TierName Name of the tier to view the leaderboard for
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Fuse from 'fuse.js';
import fetch from 'node-fetch';
import {
    deleteCommandMessages,
    roundNumber,
    startTyping,
    stopTyping,
} from '../../components';
import { TierAliases } from '../../data/dex/aliases';

export default class ShowdownCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'showdown',
            aliases: ['showdownlb', 'pokelb'],
            group: 'leaderboards',
            memberName: 'showdown',
            description: 'Show the top ranking players in your tier of choice',
            format: 'TierName',
            examples: ['showdown ou'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'tier',
                    prompt: 'Respond with the Showdown tier',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase(),
                },
            ],
        });
    }

    public async run(msg: CommandoMessage, { tier }: { tier: string }) {
        try {
            startTyping(msg);
            const fsoptions: Fuse.FuseOptions<any> = {
                shouldSort: true,
                keys: [{ name: 'alias', getfn: t => t.alias, weight: 1 }],
                location: 0,
                distance: 100,
                threshold: 0.6,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const fuseTable = new Fuse(TierAliases, fsoptions);
            const results = fuseTable.search(tier);
            const ladders = await fetch(
                `https://pokemonshowdown.com/ladder/${results[0].tier}.json`
            );
            const json = await ladders.json();
            const data = {
                elo: json.toplist
                    .map((e: any) => roundNumber(e.elo))
                    .slice(0, 10),
                losses: json.toplist.map((l: any) => l.l).slice(0, 10),
                usernames: json.toplist
                    .map((u: any) => u.username)
                    .slice(0, 10),
                wins: json.toplist.map((w: any) => w.w).slice(0, 10),
            };
            const showdownEmbed = new MessageEmbed();

            showdownEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setThumbnail(
                    'https://favna.xyz/images/ribbonhost/showdown.png'
                );

            for (const rank in data.usernames) {
                showdownEmbed.addField(
                    `${Number(rank) + 1}: ${data.usernames[rank]}`,
                    stripIndents`
                    **Wins**:${data.wins[rank]}
                    **Losses**:${data.losses[rank]}
                    **ELO**:${data.elo[rank]}
                   `,
                    true
                );
            }

            showdownEmbed.setTitle(
                `Pokemon Showdown ${results[0].tier} Leaderboard`
            );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(showdownEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.say(stripIndents`
              __**Unknown tier, has to be one of the following**__
              \`\`\`
              ╔════════════════╤══════════╤════════════╗
              ║ random battles │ randdubs │ ou         ║
              ╟────────────────┼──────────┼────────────╢
              ║ uber           │ uu       │ ru         ║
              ╟────────────────┼──────────┼────────────╢
              ║ nu             │ pu       │ lc         ║
              ╟────────────────┼──────────┼────────────╢
              ║ mono           │ ag       │ double     ║
              ╟────────────────┼──────────┼────────────╢
              ║ vgc            │ hackmons │ 1v1        ║
              ╟────────────────┼──────────┼────────────╢
              ║ mega           │ aaa      │ anyability ║
              ╚════════════════╧══════════╧════════════╝
              \`\`\``);
        }
    }
}
