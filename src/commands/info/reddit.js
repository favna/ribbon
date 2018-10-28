/**
 * @file Info RedditCommand - Gets statistics on a Reddit user  
 * **Aliases**: `red`, `redditor`
 * @module
 * @category info
 * @name Reddit
 * @example reddit favna
 * @param {StringResolvable} RedditUser The Reddit user you want to look up
 * @returns {MessageEmbed} Statistics of the reddit user
 */

import countSyllable from 'syllable';
import fetch from 'node-fetch';
import fleschKincaid from 'flesch-kincaid';
import moment from 'moment';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, roundNumber, stopTyping, startTyping} from '../../components/util.js';

module.exports = class RedditCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reddit',
      memberName: 'reddit',
      group: 'info',
      aliases: ['red', 'redditor'],
      description: 'Gets statistics on a Reddit user',
      examples: ['reddit favna'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'user',
          prompt: 'For what Reddit user do you want to view statistics?',
          type: 'string',
          validate: (v) => {
            if ((/[A-z0-9_-]/).test(v)) {
              return true;
            }

            return 'that is not a valid username, please provide a valid reddit usernmame';
          }
        }
      ]
    });
    this.comments = [];
    this.submitted = [];
  }

  async fetchData (user) {
    this.comments = [];
    this.submitted = [];

    await this.fetchAbout(user);
    await this.fetchComments(user);
    await this.fetchSubmissions(user);
  }

  async fetchAbout (user) {
    try {
      const res = await fetch(`https://www.reddit.com/user/${user}/about/.json`),
        json = await res.json();

      this.about = json.data;
    } catch (err) {
      null;
    }
  }

  async fetchComments (user, after = '') {
    try {
      const res = await fetch(`https://www.reddit.com/user/${user}/comments.json?${querystring.stringify({
          limit: 100,
          after
        })}`),
        json = await res.json(),
        arr = json.data.children;

      arr.forEach((item) => {
        this.comments.push(item);
      });

      if (arr.length === 100) {
        await this.fetchComments(user, arr[99].data.name);
      }
    } catch (err) {
      null;
    }
  }

  async fetchSubmissions (user, after = '') {
    try {
      const res = await fetch(`https://www.reddit.com/user/${user}/submitted.json?${querystring.stringify({
          limit: 100,
          after
        })}`),
        json = await res.json(),
        arr = json.data.children;

      arr.forEach((item) => {
        this.submitted.push(item);
      });

      if (arr.length === 100) {
        await this.fetchSubmissions(user, arr[99].data.name);
      }
    } catch (err) {
      null;
    }
  }

  calculateControversiality () {
    const {comments} = this;

    if (!comments.length) return 'N/A';
    if (comments.length < 5) return 0;
    let count = 0;

    comments.forEach((item) => {
      if (item.data.controversiality === 1) {
        count += 1;
      }
    });

    return count / comments.length * 100;
  }

  calculateTextComplexity () {
    const {comments} = this;

    let sentence = 0,
      syllable = 0,
      word = 0;

    comments.forEach((item) => {
      const sentences = item.data.body.split(/[\.!?]+/gm),
        words = item.data.body.trim().split(/\s+/gm);

      sentence += sentences.length - 1;
      word += words.length;

      words.forEach((wordSyl) => {
        syllable += countSyllable(wordSyl.toLowerCase());
      });
    });

    return fleschKincaid({
      sentence,
      word,
      syllable
    });
  }

  calculateTopSubredditsSubmissions () {
    const subredditCounts = [],
      subreddits = {};

    this.submitted.forEach((item) => {
      if (subreddits.hasOwnProperty(item.data.subreddit)) {
        subreddits[item.data.subreddit] += 1;
      } else {
        subreddits[item.data.subreddit] = 1;
      }
    });

    for (const subreddit in subreddits) {
      subredditCounts.push({
        name: subreddit,
        count: subreddits[subreddit]
      });
    }

    subredditCounts.sort((a, b) => b.count - a.count);
    subredditCounts.splice(5);

    return stripIndents(subredditCounts.map((val, index) => `**${index + 1}:** [/r/${val.name}](https://wwww.reddit.com/r/${val.name}) (${val.count})`).join('\n'));
  }

  calculateTopSubredditsComments () {
    const subredditCounts = [],
      subreddits = {};

    this.comments.forEach((item) => {
      if (subreddits.hasOwnProperty(item.data.subreddit)) {
        subreddits[item.data.subreddit] += 1;
      } else {
        subreddits[item.data.subreddit] = 1;
      }
    });

    for (const subreddit in subreddits) {
      subredditCounts.push({
        name: subreddit,
        count: subreddits[subreddit]
      });
    }

    subredditCounts.sort((a, b) => b.count - a.count);
    subredditCounts.splice(5);

    return stripIndents(subredditCounts.map((val, index) => `**${index + 1}:** [/r/${val.name}](https://wwww.reddit.com/r/${val.name}) (${val.count})`).join('\n'));
  }

  async run (msg, {user}) {
    try {
      startTyping(msg);
      const reply = await msg.say('`fetching and calculating statistics...`');

      await this.fetchData(user);
      this.comments.sort((a, b) => b.data.score - a.data.score);

      const bestComment = { // eslint-disable-line one-var
          content: this.comments[0].data.body,
          score: this.comments[0].data.score,
          subreddit: this.comments[0].data.subreddit,
          when: moment.unix(this.comments[0].data.created).fromNow()
        },
        complexity = this.calculateTextComplexity(),
        complexityLevels = ['very low', 'low', 'medium', 'high', 'very high', 'very high'],
        redditEmbed = new MessageEmbed(),
        worstComment = {
          content: this.comments[this.comments.length - 1].data.body,
          score: this.comments[this.comments.length - 1].data.score,
          subreddit: this.comments[this.comments.length - 1].data.subreddit,
          when: moment.unix(this.comments[this.comments.length - 1].data.created).fromNow()
        };

      redditEmbed
        .setTitle(`Overview for /u/${user}`)
        .setURL(`https://www.reddit.com/u/${user}`)
        .setColor('#FF4500')
        .setDescription(`Joined Reddit ${moment.unix(this.about.created).format('MMMM Do[,] YYYY')}`)
        .setFooter('Data is available for the past 1000 comments and submissions (Reddit API limitation)')
        .addField('Link Karma', this.about.link_karma, true)
        .addField('Comment Karma', this.about.comment_karma, true)
        .addField('Total Comments', this.comments.length, true)
        .addField('Total Submissions', this.submitted.length, true)
        .addField('Comment Controversiality', `${roundNumber(this.calculateControversiality(), 1)}%`, true)
        .addField('Text Complexity', `${complexityLevels[Math.floor(complexity / 20)]} (${roundNumber(complexity, 1)}%)`, true)
        .addBlankField()
        .addField('Top 5 Subreddits (by submissions)', this.calculateTopSubredditsSubmissions(), true)
        .addField('Top 5 Subreddits (by comments)', this.calculateTopSubredditsComments(), true)
        .addBlankField()
        .addField('Best Comment', stripIndents`
        ${bestComment.subreddit} **${bestComment.score}** ${bestComment.when}
        ${bestComment.content.slice(0, 900)}
        `, true)
        .addField('Worst Comment', stripIndents`
        ${worstComment.subreddit} **${worstComment.score}** ${worstComment.when}
        ${worstComment.content.slice(0, 900)}
        `, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      reply.delete();

      return msg.embed(redditEmbed);
    } catch (err) {
      stopTyping(msg);

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`reddit\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **User:** ${user}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};