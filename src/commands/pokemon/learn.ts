/**
 * @file Pokemon LearnCommand - Displays how a Pokemon can learn given moves, if at all
 *
 * Moves split on every `,`. See examples for usages.
 * You can specify a generation for the match by adding `--gen [1-7]` anywhere in the list of moves, with `[1-7]` being a number in that range. Generation defaults to 7
 *
 * **Aliases**: `learnset`, `learnall`
 * @module
 * @category pokemon
 * @name learn
 * @example learn dragonite dragon dance
 * @example learn dragonite dragon dance,dragon claw
 * @example learn dragonite dragon dance, dragon claw --gen 6
 * @param {string} PokemonName Name of the pokemon to get the match for
 * @param {string} [MoveName] Name of the move you want to find out about
 * @param {string} [AnotherMoveName] Any additional moves you also want to find out about
 * @param {string} [Generation] The generation to find the match for
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import { ASSET_BASE_PATH, capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';
import { BattleLearnsets } from '../../data/dex';

export default class LearnCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'learn',
            aliases: ['learnset', 'learnall'],
            group: 'pokemon',
            memberName: 'learn',
            description: 'Displays how a Pokemon can learn given moves, if at all',
            format: 'PokemonName MoveName[, AnotherMoveName...] [Generation]',
            details: stripIndents`Moves split on every \`,\`. See examples for usages.
                You can specify a generation for the match by adding \`--gen [1-7]\` anywhere in the list of moves, with \`[1-7]\` being a number in that range.
                Generation defaults to 7`,
            examples: [
                'learn dragonite dragon dance',
                'learn dragonite dragon dance,dragon claw',
                'learn dragonite dragon dance, dragon claw --gen 6'
            ],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'pokemon',
                    prompt: 'For which Pokemon should I check move learnability?',
                    type: 'string',
                    validate: (v: string) => {
                        v = v.toLowerCase().replace(/([: ])/gm, '');
                        if (v in BattleLearnsets) {
                            return true;
                        }

                        return `\`${v}\` is not a (supported) pokemon, please provide a pokemon name`;
                    },
                    parse: (p: string) => p.toLowerCase().replace(/([: ])/gm, ''),
                },
                {
                    key: 'moves',
                    prompt: 'Which move(s) should I check for that Pokemon?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase().replace(/( )/gm, ''),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { pokemon, moves }: { pokemon: string; moves: string; }) {
        try {
            startTyping(msg);
            moves = (moves as string).toLowerCase().replace(/(-)/gm, '');

            const { learnset } = BattleLearnsets[pokemon];
            const learnEmbed = new MessageEmbed();
            const movesArray: string[] = moves.includes(',') ? moves.split(',') : [moves];
            const methods: string[] = [];
            const response: string[] = [];

            movesArray.forEach((move: string): any => {
                if (move in learnset) {
                    learnset[move].forEach((learn: string): any => {
                        methods.push(learn);
                    });

                    methods.forEach((method: string): any => {
                        // tslint:disable-next-line:switch-default
                        switch (method.slice(1, 2)) {
                            case 'L':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** by level up at level ${method.slice(2)}`);
                                break;
                            case 'V':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** through virtual console transfer`);
                                break;
                            case 'T':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** through a move tutor`);
                                break;
                            case 'M':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** through TM`);
                                break;
                            case 'E':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** as Egg Move`);
                                break;
                            case 'S':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** through an event`);
                                break;
                            case 'D':
                                response.push(`In generation ${method.slice(0, 1)} ${capitalizeFirstLetter(pokemon)} **__can__** learn **${move}** through Dream World`);
                                break;
                        }
                    });
                    methods.length = 0;
                } else {
                    response.push(`${capitalizeFirstLetter(pokemon)} **__cannot__** learn **${move}**`);
                }
            });

            learnEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
                .setAuthor(
                    `${capitalizeFirstLetter(pokemon)}`,
                    `${ASSET_BASE_PATH}/ribbon/pokesprites/regular/${pokemon}.png`
                )
                .setDescription(
                    response.length
                        ? response.join('\n\n')
                        : stripIndents`${capitalizeFirstLetter(pokemon)} cannot learn ${movesArray.map((val: string) => `\`${val}\``).join(', ')}`
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(learnEmbed);
        } catch (err) {
            stopTyping(msg);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`learn\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		        **Pokemon:** ${pokemon}
                **Moves:** ${moves}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
