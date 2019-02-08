/**
 * @file Info RedditCommand - Gets statistics on a Reddit user
 * **Aliases**: `red`, `redditor`
 * @module
 * @category info
 * @name Reddit
 * @example reddit favna
 * @param {string} RedditUser The Reddit user you want to look up
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { Message, MessageEmbed, TextChannel } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class RedditCommand extends Command {
    private comments: any[];
    private submitted: any[];
    private about: any;

    constructor (client: CommandoClient) {
        super(client, {
            name: 'reddit',
            aliases: ['red', 'redditor'],
            group: 'info',
            memberName: 'reddit',
            description: 'Gets statistics on a Reddit user',
            examples: ['reddit favna'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'user',
                    prompt: 'For what Reddit user do you want to view statistics?',
                    type: 'string',
                    validate: (v: string) => {
                        if (/[A-z0-9_-]/.test(v)) {
                            return true;
                        }

                        return 'that is not a valid username, please provide a valid reddit usernmame';
                    },
                }
            ],
        });
        this.comments = [];
        this.submitted = [];
    }

    public async run (msg: CommandoMessage, { user }: { user: string }) {
        try {
            startTyping(msg);
            const reply: Message | Message[] = await msg.say('`fetching and calculating statistics...`');

            await this.fetchData(user);
            if (!this.comments.length || !this.submitted.length) throw new Error('no_user');
            this.comments.sort((a: any, b: any) => b.data.score - a.data.score);

            const bestComment = {
                content: this.comments[0].data.body,
                permalink: `https://reddit.com${this.comments[0].data.permalink}`,
                score: this.comments[0].data.score,
                subreddit: this.comments[0].data.subreddit,
                when: moment.unix(this.comments[0].data.created).fromNow(),
            };
            const complexity = roundNumber(this.calculateTextComplexity(), 2);
            const complexityLevels = ['very low', 'low', 'medium', 'high', 'very high', 'very high'];
            const redditEmbed = new MessageEmbed();
            const worstComment = {
                content: this.comments[this.comments.length - 1].data.body,
                permalink: `https://reddit.com${this.comments[this.comments.length - 1].data.permalink}`,
                score: this.comments[this.comments.length - 1].data.score,
                subreddit: this.comments[this.comments.length - 1].data.subreddit,
                when: moment.unix(this.comments[this.comments.length - 1].data.created).fromNow(),
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
                .addField(
                    'Comment Controversiality',
                    `${roundNumber(this.calculateControversiality(), 1)}%`,
                    true
                )
                .addField(
                    'Text Complexity',
                    `${complexityLevels[Math.floor(complexity / 20)]} (${roundNumber(complexity, 1)}%)`,
                    true
                )
                .addBlankField()
                .addField(
                    'Top 5 Subreddits (by submissions)',
                    this.calculateTopSubredditsSubmissions(),
                    true
                )
                .addField(
                    'Top 5 Subreddits (by comments)',
                    this.calculateTopSubredditsComments(),
                    true
                )
                .addBlankField()
                .addField(
                    'Best Comment',
                    stripIndents`${bestComment.subreddit} **${bestComment.score}** ${bestComment.when} [Permalink](${bestComment.permalink})${bestComment.content.slice(0, 900)}`,
                    true
                )
                .addField(
                    'Worst Comment',
                    stripIndents`${worstComment.subreddit} **${worstComment.score}** ${worstComment.when} [Permalink](${worstComment.permalink})${worstComment.content.slice(0, 900)}`,
                    true
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            (reply as Message).delete();

            return msg.embed(redditEmbed);
        } catch (err) {
            stopTyping(msg);

            if (/(?:no_user)/i.test(err.toString())) {
                return msg.reply(oneLine`Either there is no Reddit user \`${user}\`
                    or they do not have enough content to show`);
            }

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`reddit\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **User:** ${user}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private async fetchData (user: any) {
        await this.fetchAbout(user);
        await this.fetchComments(user);
        await this.fetchSubmissions(user);
    }

    private async fetchAbout (user: any): Promise<any> {
        try {
            const res = await fetch(`https://www.reddit.com/user/${user}/about/.json`);
            const json = await res.json();
            this.about = json.data;
        } catch (err) {
            return null;
        }
    }

    private async fetchComments (user: any, after = ''): Promise<any> {
        try {
            const res = await fetch(`https://www.reddit.com/user/${user}/comments.json?${stringify({ after, limit: 100 })}`);
            const json = await res.json();
            const arr = json.data.children;

            arr.forEach((item: any) => {
                this.comments.push(item);
            });

            if (arr.length === 100) await this.fetchComments(user, arr[99].data.name);
        } catch (err) {
            return null;
        }
    }

    private async fetchSubmissions (user: any, after = ''): Promise<any> {
        try {
            const res = await fetch(`https://www.reddit.com/user/${user}/submitted.json?${stringify({ after, limit: 100 })}`);
            const json = await res.json();
            const arr = json.data.children;

            arr.forEach((item: any) => {
                this.submitted.push(item);
            });

            if (arr.length === 100) await this.fetchSubmissions(user, arr[99].data.name);
        } catch (err) {
            return null;
        }
    }

    private calculateControversiality (): number {
        if (!this.comments.length) return 0;
        if (this.comments.length < 5) return 0;
        let count = 0;

        this.comments.forEach((item: any) => {
            if (item.data.controversiality === 1) count += 1;
        });

        return (count / this.comments.length) * 100;
    }

    private calculateTextComplexity () {
        let sentenceCount = 0;
        let syllableCount = 0;
        let wordCount = 0;

        this.comments.forEach((item: any) => {
            const sentences = item.data.body.split(/[\.!?]+/gm);
            const words = item.data.body.trim().split(/\s+/gm);

            sentenceCount += sentences.length - 1;
            wordCount += words.length;

            words.forEach((wordSyl: any) => {
                syllableCount += this.calculateSyllables(wordSyl.toLowerCase());
            });
        });

        return this.calculateKincaid(sentenceCount, wordCount, syllableCount);
    }

    private calculateTopSubredditsSubmissions () {
        const subredditCounts: any = [];
        const subreddits: any = {};

        this.submitted.forEach((item: any) => {
            if (subreddits.hasOwnProperty(item.data.subreddit)) {
                subreddits[item.data.subreddit] += 1;
            } else {
                subreddits[item.data.subreddit] = 1;
            }
        });

        for (const subreddit in subreddits) {
            subredditCounts.push({
                count: subreddits[subreddit],
                name: subreddit,
            });
        }

        subredditCounts.sort((a: any, b: any) => b.count - a.count);
        subredditCounts.splice(5);

        return stripIndents(
            subredditCounts
                .map((val: any, index: any) => `**${index + 1}:** [/r/${val.name}](https://wwww.reddit.com/r/${val.name}) (${val.count})`)
                .join('\n')
        );
    }

    private calculateTopSubredditsComments () {
        const subredditCounts: any = [];
        const subreddits: any = {};

        this.comments.forEach((item: any) => {
            if (subreddits.hasOwnProperty(item.data.subreddit)) {
                subreddits[item.data.subreddit] += 1;
            } else {
                subreddits[item.data.subreddit] = 1;
            }
        });

        for (const subreddit in subreddits) {
            subredditCounts.push({
                count: subreddits[subreddit],
                name: subreddit,
            });
        }

        subredditCounts.sort((a: any, b: any) => b.count - a.count);
        subredditCounts.splice(5);

        return stripIndents(
            subredditCounts
                .map((val: any, index: any) => `**${index + 1}:** [/r/${val.name}](https://wwww.reddit.com/r/${val.name}) (${val.count})`)
                .join('\n')
        );
    }

    private calculateSyllables (word: string) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const syl = word.match(/[aeiouy]{1,2}/g);

        return syl ? syl.length : 1;
    }

    private calculateKincaid (sentences: number, words: number, syllables: number) {
        const sentenceWeight = 0.39;
        const wordWeight = 11.8;
        const adjustment = 15.59;

        return (
            sentenceWeight * (words / sentences) +
            wordWeight * (syllables / words) -
            adjustment
        );
    }
}
