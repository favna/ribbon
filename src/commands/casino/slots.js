/**
 * @file Casino SlotsCommand - Gamble your chips at the slot machine  
 * **Aliases**: `slot`, `fruits`
 * @module
 * @category casino
 * @name slots
 * @example slots 5
 * @param {Number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the spin
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {SlotMachine, SlotSymbol} = require('slot-machine'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SlotsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slots',
      memberName: 'slots',
      group: 'casino',
      aliases: ['slot', 'fruits'],
      description: 'Gamble your chips at the slot machine',
      format: 'AmountOfChips',
      examples: ['slots 50'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
          type: 'integer',
          validate: (chips) => {
            if (/^[+]?\d+$/.test(chips) && chips >= 1 && chips <= 3) {
              return true;
            }

            return stripIndents`Reply with a chips amount
                            Has to be either 1, 2 or 3
                            1 to just win on the middle horizontal line
                            2 to win on all horizontal lines
                            3 to win on all horizontal lines **and** the two diagonal lines`;
          }
        }
      ]
    });
  }

  // eslint-disable-next-line max-statements
  run (msg, {chips}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      slotEmbed = new MessageEmbed();

    slotEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({format: 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        if (chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        const bar = new SlotSymbol('bar', {
            display: '<:bar:466061610088267776>',
            points: 50,
            weight: 20
          }),
          cherry = new SlotSymbol('cherry', {
            display: '<:cherry:466061632821395456>',
            points: 6,
            weight: 100
          }),
          diamond = new SlotSymbol('diamond', {
            display: '<:diamond:466061645118963732>',
            points: 15,
            weight: 40
          }),
          lemon = new SlotSymbol('lemon', {
            display: '<:lemon:466061677448790026>',
            points: 8,
            weight: 80
          }),
          seven = new SlotSymbol('seven', {
            display: '<:seven:466061686629990421>',
            points: 300,
            weight: 10
          }),
          watermelon = new SlotSymbol('watermelon', {
            display: '<:watermelon:466061696704839704>',
            points: 10,
            weight: 60
          });

        const machine = new SlotMachine(3, [bar, cherry, diamond, lemon, seven, watermelon]), // eslint-disable-line one-var
          prevBal = query.balance,
          result = machine.play();

        let titleString = '',
          winningPoints = 0;

        if (chips === 1 && result.lines[1].isWon) {
          winningPoints += result.lines[1].points;
        } else if (chips === 2) {
          for (let i = 0; i <= 2; ++i) {
            if (result.lines[i].isWon) {
              winningPoints += result.lines[i].points;
            }
          }
        } else if (chips === 3) {
          for (let i = 0; i < result.lines.length; ++i) {
            if (result.lines[i].isWon) {
              winningPoints += result.lines[i].points;
            }
          }
        }

        winningPoints !== 0 ? query.balance += winningPoints - chips : query.balance -= chips;

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({balance: query.balance});

        if (chips === winningPoints) {
          titleString = 'won back their exact input';
        } else if (chips > winningPoints) {
          titleString = `lost ${chips - winningPoints} chips ${winningPoints !== 0 ? `(slots gave back ${winningPoints})` : ''}`;
        } else {
          titleString = `won ${query.balance - prevBal} chips`;
        }

        slotEmbed
          .setTitle(`${msg.author.tag} ${titleString}`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setDescription(result.visualize());

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(slotEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`).run();

        return msg.reply(`looks like you don\'t have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`slots\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};