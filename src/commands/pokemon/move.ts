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

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import { moveAliases } from '@pokedex/aliases';
import BattleMovedex from '@pokedex/moves';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';
import { PokeMoveAliases, PokeMoveDetailsType } from 'RibbonTypes';

type MoveArgs = {
  move: string;
  hasManageMessages: boolean;
  position: number;
};

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

  @clientHasManageMessages()
  public async run (msg: CommandoMessage, { move, hasManageMessages, position = 0 }: MoveArgs) {
    try {
      const moveOptions: FuseOptions<PokeMoveDetailsType & PokeMoveAliases> = {
        keys: ['alias', 'move', 'id', 'name'],
        threshold: 0.2,
      };
      const aliasFuse = new Fuse(moveAliases, moveOptions);
      const moveFuse = new Fuse(BattleMovedex, moveOptions);
      const aliasSearch = aliasFuse.search(move);
      const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;
      let moveSearch = moveFuse.search(move);
      if (!moveSearch.length) moveSearch = aliasSearch.length ? moveFuse.search(aliasSearch[0].move) : [];
      if (!moveSearch.length) throw new Error('no_move');

      let currentMove = moveSearch[position];
      let moveEmbed = this.prepMessage(color, currentMove, moveSearch.length, position, hasManageMessages);

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(moveEmbed) as CommandoMessage;

      if (moveSearch.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.userid.includes(user.id)) {
              reaction.emoji.name === '➡' ? position++ : position--;
              if (position >= moveSearch.length) position = 0;
              if (position < 0) position = moveSearch.length - 1;
              currentMove = moveSearch[position];
              moveEmbed = this.prepMessage(color, currentMove, moveSearch.length, position, hasManageMessages);
              message.edit('', moveEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      if (/(?:no_move)/i.test(err.toString())) return msg.reply(stripIndents`no move found for \`${move}\``);
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`move\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** ${move}
        **Error Message:** ${err}`
      );

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`
      );
    }
  }

  private prepMessage (
    color: string, currentMove: PokeMoveDetailsType, moveSearchLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor(color)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/rotomphone.png`)
      .setTitle(sentencecase(currentMove.name))
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${moveSearchLength}` : '')
      .addField('Description', currentMove.desc ? currentMove.desc : currentMove.shortDesc)
      .addField('Type', currentMove.type, true)
      .addField('Base Power', currentMove.basePower, true)
      .addField('PP', currentMove.pp, true)
      .addField('Category', currentMove.category, true)
      .addField(
        'Accuracy',
        typeof currentMove.accuracy === 'boolean'
          ? 'Certain Success'
          : currentMove.accuracy,
        true
      )
      .addField('Priority', currentMove.priority, true)
      .addField(
        'Target',
        currentMove.target === 'normal'
          ? 'One Enemy'
          : sentencecase(currentMove.target.replace(/([A-Z])/g, ' $1')
          ),
        true
      )
      .addField('Contest Condition', currentMove.contestType, true)
      .addField(
        'Z-Crystal',
        currentMove.isZ
          ? `${sentencecase(currentMove.isZ.substring(0, currentMove.isZ.length - 1))}Z`
          : 'None',
        true
      )
      .addField('External Resources', oneLine`
        [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${currentMove.name.replace(/ /g, '_')}_(move\\))
        | [Smogon](http://www.smogon.com/dex/sm/moves/${currentMove.name.replace(/ /g, '_')})
        | [PokémonDB](http://pokemondb.net/move/${currentMove.name.replace(/ /g, '-')})
      `
      );
  }
}
