/**
 * @file Searches IGDBCommand - Gets information about a game using Internet Game Database (IGDB)
 *
 * **Aliases**: `game`, `moby`, `games`
 * @module
 * @category searches
 * @name igdb
 * @example igdb Tales of Berseria
 * @param {string} GameName The name of any game that you want to find
 */

import { CollectorTimeout, DEFAULT_EMBED_COLOR, IGBDAgeRating } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'discord.js';
import { oneLine } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { IgdbGame } from 'RibbonTypes';

interface CommandArgs {
  game: string;
  hasManageMessages: boolean;
  position: number;
}

export default class IGDBCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'igdb',
      aliases: [ 'game', 'moby', 'games' ],
      group: 'searches',
      memberName: 'igdb',
      description: 'Gets information about a game using Internet Game Database (IGDB)',
      format: 'GameName',
      examples: [ 'igdb Tales of Berseria' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'game',
          prompt: 'Which game do you want to look up on IGDB?',
          type: 'string',
        }
      ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { game, hasManageMessages, position = 0 }: CommandArgs) {
    try {
      const headers = {
        Accept: 'application/json',
        'user-key': process.env.IGDB_API_KEY!,
      };

      const igdbSearch = await fetch('https://api-v3.igdb.com/games', {
        body: oneLine`
                    search "${game}";
                    fields name, url, summary, rating, involved_companies.developer,
                           involved_companies.company.name, genres.name, release_dates.date,
                           platforms.name, cover.url, age_ratings.rating, age_ratings.category;
                    where age_ratings != n;
                    limit ${hasManageMessages ? 10 : 1};
                    offset 0;
                `,
        headers,
        method: 'POST',
      });
      const gameInfo: IgdbGame[] = await igdbSearch.json();
      const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

      let currentGame = gameInfo[position];
      let gameEmbed = this.prepMessage(
        color, currentGame, gameInfo.length, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(gameEmbed) as CommandoMessage;

      if (gameInfo.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= gameInfo.length) position = 0;
              if (position < 0) position = gameInfo.length - 1;
              currentGame = gameInfo[position];
              gameEmbed = this.prepMessage(
                color, currentGame, gameInfo.length, position, hasManageMessages
              );
              message.edit('', gameEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`nothing found for \`${game}\``);
    }
  }

  private prepMessage(
    color: string, game: IgdbGame, gameSearchLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    const coverImg = /https?:/i.test(game.cover.url) ? game.cover.url : `https:${game.cover.url}`;

    return new MessageEmbed()
      .setColor(color)
      .setTitle(game.name)
      .setURL(game.url)
      .setThumbnail(coverImg)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${gameSearchLength}` : '')
      .addField('User Score', roundNumber(game.rating, 1), true)
      .addField('Age Rating(s)', game.age_ratings.map(ageRating => `${ageRating.category === 1 ? 'ESRB' : 'PEGI'}: ${IGBDAgeRating[ageRating.rating]}`), true)
      .addField('Release Date', moment.unix(game.release_dates[0].date).format('MMMM Do YYYY'), true)
      .addField('Genre(s)', game.genres.map(genre => genre.name).join(', '), true)
      .addField('Developer(s)', game.involved_companies.map(company => company.developer ? company.company.name : null).filter(Boolean).join(', '), true)
      .addField('Platform(s)', game.platforms.map(platform => platform.name).join(', '), true)
      .setDescription(game.summary);
  }
}