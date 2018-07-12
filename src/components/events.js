/**
 * @file Ribbon Modules - Event modules for Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 */

/* eslint-disable one-var */

const Database = require('better-sqlite3'),
  Jimp = require('jimp'),
  moment = require('moment'),
  path = require('path'),
  {MessageEmbed, MessageAttachment} = require('discord.js'),
  {promisify} = require('util'),
  {ordinal} = require(path.join(__dirname, 'util.js')),
  {stripIndents} = require('common-tags');

const checkReminders = async function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/reminders.sqlite3'));

  try {
    const query = conn.prepare('SELECT * FROM "reminders"').all();

    for (const row in query) {
      const remindTime = moment(query[row].remindTime),
        dura = moment.duration(remindTime.diff()); // eslint-disable-line sort-vars

      if (dura.asMinutes() <= 0) {
        const user = await client.users.get(query[row].userID);

        user.send({
          embed: {
            color: 10610610,
            description: query[row].remindText,
            author: {
              name: 'Ribbon Reminders',
              iconURL: client.user.displayAvatarURL({format: 'png'})
            },
            thumbnail: {url: 'https://favna.xyz/images/ribbonhost/reminders.png'}
          }
        });
        conn.prepare('DELETE FROM "reminders" WHERE userID = $userid AND remindTime = $remindTime').run({
          userid: query[row].userID,
          remindTime: query[row].remindTime
        });
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Error occurred sending someone their reminder!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }
};

const forceStopTyping = function (client) {
  const allChannels = client.channels;

  for (const channel of allChannels.values()) {
    if (channel.type === 'text' || channel.type === 'dm' || channel.type === 'group') {
      if (client.user.typingDurationIn(channel) > 10000) {
        channel.stopTyping(true);
      }
    }
  }
};

const guildAdd = async function (client, guild) {
  try {
    Jimp.prototype.getBufferAsync = promisify(Jimp.prototype.getBuffer);
    /* eslint-disable sort-vars*/
    const avatar = await Jimp.read(client.user.displayAvatarURL({format: 'png'})),
      border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
      canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
      mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png'),
      fontMedium = await Jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt')),
      newGuildEmbed = new MessageEmbed(),
      channel = guild.systemChannel ? guild.systemChannel : null;
    /* eslint-enable sort-vars*/

    avatar.resize(136, Jimp.AUTO);
    mask.resize(136, Jimp.AUTO);
    border.resize(136, Jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontMedium, 155, 55, `Currently powering up ${client.guilds.size} servers`.toUpperCase());
    canvas.print(fontMedium, 155, 75, `serving ${client.users.size} Discord users`.toUpperCase());

    const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG),
      embedAttachment = new MessageAttachment(buffer, 'added.png');

    newGuildEmbed
      .attachFiles([embedAttachment])
      .setColor('#80F31F')
      .setTitle('Ribbon is here!')
      .setDescription(stripIndents`
      I'm an all-purpose bot and I hope I can make your server better!
      I've got many commands, you can see them all by using \`${client.commandPrefix}help\`
      Don't like the prefix? The admins can change my prefix by using \`${client.commandPrefix}prefix [new prefix]\`
      
      **All these commands can also be called by mentioning me instead of using a prefix, for example \`@${client.user.tag} help\`**
      `)
      .setImage('attachment://added.png');

    return channel ? channel.send('', {embed: newGuildEmbed}) : null;
  } catch (err) {
    return null;
  }
};

const guildLeave = function (client, guild) {
  guild.settings.clear();
  const casinoConn = new Database(path.join(__dirname, '../data/databases/casino.sqlite3')),
    pastasConn = new Database(path.join(__dirname, '../data/databases/pastas.sqlite3')),
    timerConn = new Database(path.join(__dirname, '../data/databases/timers.sqlite3')),
    warningsConn = new Database(path.join(__dirname, '../data/databases/warnings.sqlite3'));

  try {
    casinoConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Failed to purge ${guild.name} (${guild.id}) from the casino database!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }

  try {
    pastasConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Failed to purge ${guild.name} (${guild.id}) from the pastas database!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }

  try {
    timerConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Failed to purge ${guild.name} (${guild.id}) from the timers database!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }

  try {
    warningsConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
      <@${client.owners[0].id}> Failed to purge ${guild.name} (${guild.id}) from the warnings database!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
  }
};

const joinmessage = async function (member) {
  Jimp.prototype.getBufferAsync = promisify(Jimp.prototype.getBuffer);
  /* eslint-disable sort-vars*/
  const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
    border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
    canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
    newMemberEmbed = new MessageEmbed(),
    fontLarge = await Jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-large.fnt')),
    fontMedium = await Jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt')),
    mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
  /* eslint-enable sort-vars*/

  avatar.resize(136, Jimp.AUTO);
  mask.resize(136, Jimp.AUTO);
  border.resize(136, Jimp.AUTO);
  avatar.mask(mask, 0, 0);
  avatar.composite(border, 0, 0);
  canvas.blit(avatar, 5, 5);
  canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
  canvas.print(fontMedium, 160, 60, `you are the ${ordinal(member.guild.memberCount)} member`.toUpperCase());
  canvas.print(fontMedium, 160, 80, `of ${member.guild.name}`.toUpperCase());

  const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG),
    embedAttachment = new MessageAttachment(buffer, 'joinimg.png');

  newMemberEmbed
    .attachFiles([embedAttachment])
    .setColor('#80F31F')
    .setTitle('NEW MEMBER!')
    .setDescription(`Please give a warm welcome to __**${member.displayName}**__  (\`${member.id}\`)`)
    .setImage('attachment://joinimg.png');

  member.guild.channels.get(member.guild.settings.get('joinmsgchannel')).send(`welcome <@${member.id}> 🎗️!`, {embed: newMemberEmbed});
};

const leavemessage = async function (member) {
  Jimp.prototype.getBufferAsync = promisify(Jimp.prototype.getBuffer);
  /* eslint-disable sort-vars*/
  const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
    border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
    canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
    leaveMemberEmbed = new MessageEmbed(),
    fontLarge = await Jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-large.fnt')),
    fontMedium = await Jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt')),
    mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
  /* eslint-enable sort-vars*/

  avatar.resize(136, Jimp.AUTO);
  mask.resize(136, Jimp.AUTO);
  border.resize(136, Jimp.AUTO);
  avatar.mask(mask, 0, 0);
  avatar.composite(border, 0, 0);
  canvas.blit(avatar, 5, 5);
  canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
  canvas.print(fontMedium, 160, 60, `there are now ${member.guild.memberCount} members`.toUpperCase());
  canvas.print(fontMedium, 160, 80, `on ${member.guild.name}`.toUpperCase());

  // eslint-disable-next-line one-var
  const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG),
    embedAttachment = new MessageAttachment(buffer, 'leaveimg.png');

  leaveMemberEmbed
    .attachFiles([embedAttachment])
    .setColor('#F4BF42')
    .setTitle('Member Left 😢')
    .setDescription(`You will be missed __**${member.displayName}**__ (${member.id})`)
    .setImage('attachment://leaveimg.png');

  member.guild.channels.get(member.guild.settings.get('leavemsgchannel')).send('', {embed: leaveMemberEmbed});
};

const lotto = function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/casino.sqlite3'));

  try {
    const tables = conn.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all();

    for (const table in tables) {
      const rows = conn.prepare(`SELECT * FROM "${tables[table].name}"`).all(),
        winner = Math.floor(Math.random() * rows.length),
        prevBal = rows[winner].balance; // eslint-disable-line sort-vars

      rows[winner].balance += 2000;

      conn.prepare(`UPDATE "${tables[table].name}" SET balance=$balance WHERE userID="${rows[winner].userID}"`).run({balance: rows[winner].balance});

      // eslint-disable-next-line one-var
      const defaultChannel = client.guilds.get(tables[table].name).systemChannel,
        winnerEmbed = new MessageEmbed(),
        winnerLastMessage = client.guilds.get(tables[table].name).members.get(rows[winner].userID).lastMessageChannelID,
        winnerLastMessageChannel = winnerLastMessage ? client.guilds.get(tables[table].name).channels.get(winnerLastMessage) : null,
        winnerLastMessageChannelPermitted = winnerLastMessageChannel ? winnerLastMessageChannel.permissionsFor(client.user).has('SEND_MESSAGES') : false;

      winnerEmbed
        .setColor('#7CFC00')
        .setDescription(`Congratulations <@${rows[winner].userID}>! You won today's random lotto and were granted 2000 chips 🎉!`)
        .setAuthor(client.guilds.get(tables[table].name).members.get(rows[winner].userID).displayName,
          client.guilds.get(tables[table].name).members.get(rows[winner].userID).user.displayAvatarURL({format: 'png'}))
        .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png')
        .addField('Balance', `${prevBal} ➡ ${rows[winner].balance}`);

      if (winnerLastMessageChannelPermitted) {
        winnerLastMessageChannel.send(`<@${rows[winner].userID}>`, {embed: winnerEmbed});
      } else if (defaultChannel) {
        defaultChannel.send(`<@${rows[winner].userID}>`, {embed: winnerEmbed});
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
    <@${client.owners[0].id}> Error occurred giving someone their lotto payout!
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err}
    `);
  }
};

const timermessages = function (client) {
  const conn = new Database(path.join(__dirname, '../data/databases/timers.sqlite3'));

  try {
    const tables = conn.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name != \'sqlite_sequence\';').all();

    for (const table in tables) {
      const rows = conn.prepare(`SELECT * FROM "${tables[table].name}"`).all();

      /* eslint-disable sort-vars*/
      for (const row in rows) {
        const timermoment = moment(rows[row].lastsend).add(rows[row].interval, 'ms'),
          dura = moment.duration(timermoment.diff());

        if (dura.asMinutes() <= 0) {
          conn.prepare(`UPDATE "${tables[table].name}" SET lastsend=$lastsend WHERE id=$id;`).run({
            id: rows[row].id,
            lastsend: moment().format('YYYY-MM-DD HH:mm')
          });
          const guild = client.guilds.get(tables[table].name),
            channel = guild.channels.get(rows[row].channel),
            timerEmbed = new MessageEmbed(),
            {me} = client.guilds.get(tables[table].name);
          /* eslint-enable sort-vars*/

          timerEmbed
            .setAuthor('Ribbon Timed Message', me.user.displayAvatarURL({format: 'png'}))
            .setColor(me.displayHexColor)
            .setDescription(rows[row].content);

          channel.send('', {embed: timerEmbed});
        }
      }
    }
  } catch (err) {
    client.channels.get(process.env.ribbonlogchannel).send(stripIndents`
    <@${client.owners[0].id}> Error occurred sending a timed message!
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err}
    `);
  }
};

module.exports = {
  checkReminders,
  forceStopTyping,
  guildAdd,
  guildLeave,
  joinmessage,
  leavemessage,
  lotto,
  timermessages
};