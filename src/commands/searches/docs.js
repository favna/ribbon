/**
 * @file Searches DocsCommand - Get an entry from the Discord.JS documentation  
 * **Aliases**: `djsguide`, `guide`, `djs`
 * @module
 * @category searches
 * @name docs
 * @example docs ClientUser
 * @param {StringResolvable} DocEntry The entry from the docs you want to get info about
 * @returns {MessageEmbed} Info about the entry from the library
 */

import Fuse from 'fuse.js';
import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, startTyping, stopTyping} from '../../components/util.js';

module.exports = class DocsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'docs',
      memberName: 'docs',
      group: 'searches',
      aliases: ['djsguide', 'guide', 'djs'],
      description: 'Gets info from something in the DJS docs',
      format: 'TopicToFind [master|stable|commando]',
      examples: ['docs ClientUser'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'what would you like to find?\n',
          type: 'string',
          parse: p => p.split(/[\#\.]/)
        },
        {
          key: 'version',
          prompt: 'which version of docs would you like (stable, master, commando)?',
          type: 'string',
          parse: value => value.toLowerCase(),
          validate: value => ['master', 'stable', 'commando'].includes(value),
          default: 'stable'
        }
      ]
    });

    this.docs = {}; // Cache for docs
  }

  async fetchDocs (version) {
    if (this.docs[version]) {
      return this.docs[version];
    }

    const link = version === 'commando'
        ? 'https://raw.githubusercontent.com/Gawdl3y/discord.js-commando/docs/master.json'
        : `https://raw.githubusercontent.com/discordjs/discord.js/docs/${version}.json`,
      res = await fetch(link),
      json = res.json();

    this.docs[version] = json;

    return json;
  }

  clean (text) {
    return text.replace(/\n/g, ' ')
      .replace(/<\/?(?:info|warn)>/g, '')
      .replace(/\{@link (.+?)\}/g, '`$1`');
  }

  joinType (types, version, docs) {
    return types.map(type => type.map((t) => {
      if (t.length === 1) {
        return `[${t[0]}](${this.docifyLink(t[0], version, docs)})`;
      } else if (t[1] === '>') {
        return `[<${t[0]}>](${this.docifyLink(t[0], version, docs)})`;
      }

      return `[${t[0]}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${t[0]})`;
    }));
  }

  docifyLink (prop, version, docs) {
    let section = 'classes';
    const docsBaseURL = `https://discord.js.org/#/docs/${version === 'commando' ? 'commando/master' : `main/${version}`}`,
      matchCheck = docs[section].find(el => el.name === prop);

    if (!matchCheck || matchCheck.name !== prop) {
      section = 'typedefs';
    }

    return `${docsBaseURL}/${section === 'classes' ? 'class' : 'typedef'}/${prop}`;
  }

  /* eslint-disable complexity */
  async run (msg, {query, version}) {
    try {
      startTyping(msg);

      const docs = await this.fetchDocs(version),
        sourceBaseURL = `https://github.com/discordjs/${version === 'commando' ? 'commando/blob/master' : `discord.js/blob/${version}`}`,
        hitOpts = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name']
        },
        input = {
          main: query[0],
          sub: query[1] ? query[1].replace(/(\(.*\))/gm, '') : null
        },
        docsFuse = new Fuse(docs.classes.concat(docs.typedefs), hitOpts),
        docsEmbed = new MessageEmbed(),
        docsSearch = docsFuse.search(input.main),
        hit = docsSearch[0];

      docsEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setAuthor(version === 'commando' ? 'Commando Docs' : `Discord.JS Docs (${version})`, 'https://github.com/discordjs.png');

      if (input.sub) {

        const subopts = {
            shouldSort: true,
            threshold: 0.2,
            location: 5,
            distance: 0,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ['name']
          },
          propsFuse = hit.props ? new Fuse(hit.props, subopts) : null,
          methodFuse = hit.methods ? new Fuse(hit.methods, subopts) : null,
          eventsFuse = hit.events ? new Fuse(hit.events, subopts) : null,
          subHit = {
            props: propsFuse ? propsFuse.search(input.sub) : [],
            methods: methodFuse ? methodFuse.search(input.sub) : [],
            events: eventsFuse ? eventsFuse.search(input.sub) : []
          };

        subLoop: for (const sub in subHit) {
          if (subHit[sub].length) {
            const res = subHit[sub][0];

            // eslint-disable-next-line no-extend-native
            Array.prototype.toString = function () {
              return this.join('');
            };

            switch (sub) {
            case 'props':
              docsEmbed
                .setDescription(stripIndents`${oneLine`[__**${hit.name}.${res.name}**__](${this.docifyLink(hit.name, version, docs)}?scrollTo=${res.name})`}
              ${hit.description}`)
                .addField('Type', `${this.joinType(res.type, version, docs)}`);
              break subLoop;
            case 'methods':
              docsEmbed
                .setDescription(stripIndents`${oneLine`[__**${hit.name}.${res.name}()**__](${this.docifyLink(hit.name, version, docs)}?scrollTo=${res.name})`}
              ${hit.description}`)
                .addField('Parameters',
                  res.params.map(param => `\`${param.optional ? `[${param.name}]` : param.name}:\` **${this.joinType(param.type, version, docs).join(' | ')}**\n${this.clean(param.description)}\n`))
                .addField('Returns', `${res.returns.description ? `${this.clean(res.returns.description)}` : ''} **⇒** **${this.joinType(res.returns.types || res.returns, version, docs)}**`)
                .addField('Example(s)', `\`\`\`js\n${res.examples.join('```\n```js\n')}\`\`\``)
                .addField('\u200b', `[View Source](${sourceBaseURL}/${res.meta.path}/${res.meta.file}#L${res.meta.line})`);
              break subLoop;
            case 'events':
              docsEmbed
                .setDescription(stripIndents`${oneLine`[__**${hit.name}.on('${res.name}' … )**__](${this.docifyLink(hit.name, version, docs)}?scrollTo=${res.name})`}
                ${hit.description}`)
                .addField('Parameters',
                  res.params.map(param => `\`${param.optional ? `[${param.name}]` : param.name}:\` **${this.joinType(param.type, version, docs)}**\n${this.clean(param.description)}\n`))
                .addField('\u200b', `[View Source](${sourceBaseURL}/${res.meta.path}/${res.meta.file}#L${res.meta.line})`);
              break subLoop;
            default:
              throw new Error('none found');
            }
          } else if (sub === 'events') {
            throw new Error('none found');
          }
        }
      } else {
        docsEmbed
          .setDescription(stripIndents`${oneLine`[__**${hit.name}**__](${this.docifyLink(hit.name, version, docs)})
          ${hit.extends ? ` (extends [**${hit.extends}**](${this.docifyLink(hit.extends[0], version, docs)}))` : ''}`}
          ${hit.description}`);

        hit.props ? docsEmbed.addField('Properties', `\`${hit.props.map(p => p.name).join('` `')}\``) : null;
        hit.methods ? docsEmbed.addField('Methods', `\`${hit.methods.map(m => m.name).join('` `')}\``) : null;
        hit.events ? docsEmbed.addField('Events', `\`${hit.events.map(e => e.name).join('` `')}\``) : null;
        hit.type ? docsEmbed.addField('Type', this.joinType(hit.type, version, docs)) : null;

        docsEmbed.addField('\u200b', `[View Source](${sourceBaseURL}/${hit.meta.path}/${hit.meta.file}#L${hit.meta.line})`);
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(docsEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`could not find an item for \`${query.join('.')}\` in the ${version === 'commando' ? 'Commando' : `Discord.JS ${version}`} docs.`);
    }

  }
};