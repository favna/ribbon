/* eslint-disable max-lines */

/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Searches DocsCommand - Get an entry from the Discord.JS documentation  
 * **Aliases**: `djsguide`, `guide`, `djs`
 * @module
 * @category searches
 * @name docs
 * @example docs ClientUser
 * @param {string} DocEntry The entry from the docs you want to get info about
 * @returns {MessageEmbed} Info about the entry from the library
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {oneLineTrim} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

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
          type: 'string'
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
      : `https://raw.githubusercontent.com/hydrabolt/discord.js/docs/${version}.json`;

    const {text} = await request.get(link), // eslint-disable-line one-var
      json = JSON.parse(text);

    this.docs[version] = json;

    return json;
  }

  search (docs, query) { // eslint-disable-line max-statements
    query = query.split(/[#.]/); // eslint-disable-line no-param-reassign
    const mainQuery = query[0].toLowerCase();
    let memberQuery = query[1] ? query[1].toLowerCase() : null;

    const findWithin = (parentItem, props, name) => { // eslint-disable-line one-var
      let found = null;

      for (const category of props) {
        if (!parentItem[category]) {
          continue; // eslint-disable-line no-continue
        }
        const item = parentItem[category].find(i => i.name.toLowerCase() === name);

        if (item) {
          found = {
            item,
            category
          };
          break;
        }
      }

      return found;
    };

    const main = findWithin(docs, ['classes', 'interfaces', 'typedefs'], mainQuery); // eslint-disable-line one-var

    if (!main) {
      return [];
    }

    const res = [main]; // eslint-disable-line one-var

    if (!memberQuery) {
      return res;
    }

    let props; // eslint-disable-line one-var, init-declarations

    if (/\(.*?\)$/.test(memberQuery)) {
      memberQuery = memberQuery.replace(/\(.*?\)$/, '');
      props = ['methods'];
    } else {
      props = main.category === 'typedefs' ? ['props'] : ['props', 'methods', 'events'];
    }

    const member = findWithin(main.item, props, memberQuery); // eslint-disable-line one-var

    if (!member) {
      return [];
    }

    const rest = query.slice(2); // eslint-disable-line one-var

    if (rest.length) {
      if (!member.item.type) {
        return [];
      }
      const base = this.joinType(member.item.type)
        .replace(/<.+>/g, '')
        .replace(/\|.+/, '')
        .trim();

      return this.search(docs, `${base}.${rest.join('.')}`);
    }

    res.push(member);

    return res;
  }

  clean (text) {
    return text.replace(/\n/g, ' ')
      .replace(/<\/?(?:info|warn)>/g, '')
      .replace(/\{@link (.+?)\}/g, '`$1`');
  }

  joinType (type) {
    return type.map(t => t.map(a => Array.isArray(a) ? a.join('') : a).join('')).join(' | '); // eslint-disable-line no-confusing-arrow
  }

  getLink (version) {
    return version === 'commando'
      ? 'https://discord.js.org/#/docs/commando/master/'
      : `https://discord.js.org/#/docs/main/${version}/`;
  }

  makeLink (main, member, version) {
    return oneLineTrim`
			${this.getLink(version)}
			${main.category === 'classes' ? 'class' : 'typedef'}/${main.item.name}
			?scrollTo=${member.item.scope === 'static' ? 's-' : ''}${member.item.name}
		`;
  }

  formatMain (main, version) {
    const embed = {
      description: `__**[${main.item.name}`,
      fields: []
    };

    if (main.item.extends) {
      embed.description += ` (extends ${main.item.extends[0]})`;
    }

    embed.description += oneLineTrim`
			](${this.getLink(version)}
			${main.category === 'classes' ? 'class' : 'typedef'}/${main.item.name})**__
		`;

    embed.description += '\n';
    if (main.item.description) {
      embed.description += `\n${this.clean(main.item.description)}`;
    }

    const join = it => `\`${it.map(index => index.name).join('` `')}\``; // eslint-disable-line one-var

    if (main.item.props) {
      embed.fields.push({
        name: 'Properties',
        value: join(main.item.props)
      });
    }

    if (main.item.methods) {
      embed.fields.push({
        name: 'Methods',
        value: join(main.item.methods)
      });
    }

    if (main.item.events) {
      embed.fields.push({
        name: 'Events',
        value: join(main.item.events)
      });
    }

    return embed;
  }

  formatProp (main, member, version) {
    const embed = {
      description: oneLineTrim`
				__**[${main.item.name}${member.item.scope === 'static' ? '.' : '#'}${member.item.name}]
				(${this.makeLink(main, member, version)})**__
			`,
      fields: []
    };

    embed.description += '\n';
    if (member.item.description) {
      embed.description += `\n${this.clean(member.item.description)}`;
    }

    const type = this.joinType(member.item.type); // eslint-disable-line one-var

    embed.fields.push({
      name: 'Type',
      value: `\`${type}\``
    });

    if (member.item.examples) {
      embed.fields.push({
        name: 'Example',
        value: `\`\`\`js\n${member.item.examples.join('```\n```js\n')}\`\`\``
      });
    }

    return embed;
  }

  formatMethod (main, member, version) {
    const embed = {
      description: oneLineTrim`
				__**[${main.item.name}${member.item.scope === 'static' ? '.' : '#'}${member.item.name}()]
				(${this.makeLink(main, member, version)})**__
			`,
      fields: []
    };

    embed.description += '\n';
    if (member.item.description) {
      embed.description += `\n${this.clean(member.item.description)}`;
    }

    if (member.item.params) {
      const params = member.item.params.map((param) => {
        const name = param.optional ? `[${param.name}]` : param.name;
        const type = this.joinType(param.type); // eslint-disable-line one-var


        return `\`${name}: ${type}\`\n${this.clean(param.description)}`;
      });

      embed.fields.push({
        name: 'Parameters',
        value: params.join('\n\n')
      });
    }

    if (member.item.returns) {
      const desc = member.item.returns.description ? `${this.clean(member.item.returns.description)}\n` : '';
      const type = this.joinType(member.item.returns.types || member.item.returns), // eslint-disable-line one-var
        returns = `${desc}\`=> ${type}\``; // eslint-disable-line sort-vars

      embed.fields.push({
        name: 'Returns',
        value: returns
      });
    } else {
      embed.fields.push({
        name: 'Returns',
        value: '`=> void`'
      });
    }

    if (member.item.examples) {
      embed.fields.push({
        name: 'Example',
        value: `\`\`\`js\n${member.item.examples.join('```\n```js\n')}\`\`\``
      });
    }

    return embed;
  }

  formatEvent (main, member, version) {
    const embed = {
      description: `__**[${main.item.name}#${member.item.name}](${this.makeLink(main, member, version)})**__\n`,
      fields: []
    };

    if (member.item.description) {
      embed.description += `\n${this.clean(member.item.description)}`;
    }

    if (member.item.params) {
      const params = member.item.params.map((param) => {
        const type = this.joinType(param.type);


        return `\`${param.name}: ${type}\`\n${this.clean(param.description)}`;
      });

      embed.fields.push({
        name: 'Parameters',
        value: params.join('\n\n')
      });
    }

    if (member.item.examples) {
      embed.fields.push({
        name: 'Example',
        value: `\`\`\`js\n${member.item.examples.join('```\n```js\n')}\`\`\``
      });
    }

    return embed;
  }

  async run (msg, {
    query,
    version
  }) {
    startTyping(msg);
    const docs = await this.fetchDocs(version);
    const [main, member] = this.search(docs, query); // eslint-disable-line one-var

    if (!main) {
      return msg.say('Could not find that item in the docs.');
    }

    const embed = member ? { // eslint-disable-line one-var, prefer-reflect
      props: this.formatProp,
      methods: this.formatMethod,
      events: this.formatEvent
    }[member.category].call(this, main, member, version) : this.formatMain(main, version);


    embed.url = this.getLink(version);
    embed.author = {
      name: version === 'commando' ? 'Commando Docs' : `MessageEmbedjs Docs (${version})`,
      iconURL: 'https://github.com/discordjs.png'
    };

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};