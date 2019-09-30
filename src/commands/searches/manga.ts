/**
 * @file Searches MangaCommand - Gets information about any manga from kitsu.io
 *
 * **Aliases**: `cartoon`, `man`
 * @module
 * @category searches
 * @name manga
 * @example manga Yu-Gi-Oh
 * @param {string} AnyManga manga to look up
 */

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, removeDiacritics } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'discord.js';
import moment from 'moment';
import fetch from 'node-fetch';
import { KitsuHit, KitsuResult } from 'RibbonTypes';
import stringify from '@favware/querystring';

interface MangaArgs {
  manga: string;
  hasManageMessages: boolean;
  position: number;
}

export default class MangaCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'manga',
      aliases: [ 'cartoon', 'man' ],
      group: 'searches',
      memberName: 'manga',
      description: 'Finds manga on kitsu.io',
      format: 'MangaName',
      examples: [ 'manga Pokemon' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'manga',
          prompt: 'What manga do you want to find?',
          type: 'string',
          parse: (p: string) => removeDiacritics(p.toLowerCase().replace(/([^a-zA-Z0-9_\- ])/gm, '')),
        }
      ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { manga, hasManageMessages, position = 0 }: MangaArgs) {
    try {
      const mangaList = await fetch(`https://${process.env.KITSU_ID!}-dsn.algolia.net/1/indexes/production_media/query`,
        {
          body: JSON.stringify(
            {
              params: stringify({
                query: manga,
                facetFilters: [ 'kind:manga' ],
              }),
            }
          ),
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-API-Key': process.env.KITSU_KEY!,
            'X-Algolia-Application-Id': process.env.KITSU_ID!,
          },
          method: 'POST',
        });
      const mangas: KitsuResult = await mangaList.json();
      const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

      let currentManga = mangas.hits[position];
      let mangaEmbed = this.prepMessage(
        color, currentManga, mangas.hits.length, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(mangaEmbed, `https://kitsu.io/manga/${currentManga.slug}`) as CommandoMessage;

      if (mangas.hits.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= mangas.hits.length) position = 0;
              if (position < 0) position = mangas.hits.length - 1;
              currentManga = mangas.hits[position];
              mangaEmbed = this.prepMessage(
                color, currentManga, mangas.hits.length, position, hasManageMessages
              );
              message.edit(`https://kitsu.io/manga/${currentManga.slug}`, mangaEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no manga found for \`${manga}\` `);
    }
  }

  private prepMessage(
    color: string, manga: KitsuHit, mangaLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setColor(color)
      .setTitle(manga.titles.en ? manga.titles.en : manga.canonicalTitle)
      .setURL(`https://kitsu.io/manga/${manga.id}`)
      .setDescription(manga.synopsis.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0])
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${mangaLength}` : '')
      .setImage(manga.posterImage && manga.posterImage.original ? manga.posterImage.original : `${ASSET_BASE_PATH}/ribbon/kitsulogo.png`)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/kitsulogo.png`)
      .addField('Canonical Title', manga.canonicalTitle, true)
      .addField('Score', `${manga.averageRating}%`, true)
      .addField('Age Rating', manga.ageRating ? manga.ageRating : 'None', true)
      .addField('First Publish Date', moment.unix(manga.startDate).format('MMMM Do YYYY'), true);
  }
}