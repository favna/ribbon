/**
 * @file Pokémon MoveCommand - Gets information about a move in Pokémon
 *
 * For move names existing of multiple words (for example `dragon dance`) you can either type it with or without the space
 *
 * **Aliases**: `attack`
 * @module
 * @category pokémon
 * @name move
 * @example move dragon dance
 * @param {string} MoveName The move you want to find
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Fuse from 'fuse.js';
import * as moment from 'moment';
import { capitalizeFirstLetter, deleteCommandMessages, startTyping, stopTyping, UnionPokeMove } from '../../components';
import { BattleMovedex, MoveAliases } from '../../data/dex';

export default class MoveCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'move',
            aliases: ['attack'],
            group: 'pokemon',
            memberName: 'move',
            description: 'Get the info on a Pokémon move',
            format: 'MoveName',
            examples: ['move Dragon Dance'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'move',
                    prompt: 'Get info on which move?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { move }: { move: string }) {
        try {
            startTyping(msg);

            const moveOptions: Fuse.FuseOptions<UnionPokeMove> = {
                shouldSort: true,
                keys: [
                    { name: 'alias', getfn: t => t.alias, weight: 0.2 },
                    { name: 'move', getfn: t => t.move, weight: 0.2 },
                    { name: 'id', getfn: t => t.id, weight: 1 },
                    { name: 'name', getfn: t => t.name, weight: 1 }
                ],
                location: 0,
                distance: 100,
                threshold: 0.2,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const aliasFuse = new Fuse(MoveAliases, moveOptions);
            const moveFuse = new Fuse(BattleMovedex, moveOptions);
            const aliasSearch = aliasFuse.search(move);
            let moveSearch = moveFuse.search(move);
            if (!moveSearch.length) moveSearch = aliasSearch.length ? moveFuse.search(aliasSearch[0].move) : [];
            if (!moveSearch.length) throw new Error('no_move');
            const hit = moveSearch[0];
            const moveEmbed = new MessageEmbed();

            moveEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
                .setTitle(capitalizeFirstLetter(hit.name))
                .addField('Description', hit.desc ? hit.desc : hit.shortDesc)
                .addField('Type', hit.type, true)
                .addField('Base Power', hit.basePower, true)
                .addField('PP', hit.pp, true)
                .addField('Category', hit.category, true)
                .addField(
                    'Accuracy',
                    typeof hit.accuracy === 'boolean'
                        ? 'Certain Success'
                        : hit.accuracy,
                    true
                )
                .addField('Priority', hit.priority, true)
                .addField(
                    'Target',
                    hit.target === 'normal'
                        ? 'One Enemy'
                        : capitalizeFirstLetter(hit.target.replace(/([A-Z])/g, ' $1')
                        ),
                    true
                )
                .addField('Contest Condition', hit.contestType, true)
                .addField(
                    'Z-Crystal',
                    hit.isZ
                        ? `${capitalizeFirstLetter(hit.isZ.substring(0, hit.isZ.length - 1))}Z`
                        : 'None',
                    true
                )
                .addField('External Resources', oneLine`
                    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${hit.name.replace(/ /g, '_')}_(move\\))
                    |  [Smogon](http://www.smogon.com/dex/sm/moves/${hit.name.replace(/ /g, '_')})
                    |  [PokémonDB](http://pokemondb.net/move/${hit.name.replace(/ /g, '-')})
                    `
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(moveEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            if (/(?:no_move)/i.test(err.toString())) return msg.reply(stripIndents`no move found for \`${move}\``);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`move\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${move}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
