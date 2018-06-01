/**
 * @file Games FightCommand - Pit two things against each other in a fight to the death.  
 * Winner is determined with random.org randomization.  
 * **Aliases**: `combat`
 * @module
 * @category games
 * @name fight
 * @example fight Pyrrha Ruby
 * @param {StringResolvable} FighterOne The first combatant
 * @param {StringResolvable} FighterTwo The second combatant
 * @returns {MessageEmbed} Result of the combat
 */

const random = require('node-random'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class FightCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fight',
      memberName: 'fight',
      group: 'games',
      aliases: ['combat'],
      description: 'Pit two things against each other in a fight to the death.',
      details: 'Winner is determined with random.org randomization',
      format: 'FirstFighter, SecondFighter',
      examples: ['fight Favna Chuck Norris'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'fighterOne',
          prompt: 'Who or what is the first fighter?',
          type: 'string'
        },
        {
          key: 'fighterTwo',
          prompt: 'What or what is the second fighter?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {fighterOne, fighterTwo}) {
    startTyping(msg);
    const fighterEmbed = new MessageEmbed();

    fighterEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setTitle('🥊 Fight Results 🥊')
      .setThumbnail('https://favna.xyz/images/ribbonhost/dbxlogo.png');

    if (fighterOne.toLowerCase() === 'chuck norris' || fighterTwo.toLowerCase() === 'chuck norris') {
      if (fighterOne.toLowerCase() === 'favna' || fighterTwo.toLowerCase() === 'favna') {
        fighterEmbed
          .addField('All right, you asked for it...', '***The universe was destroyed due to this battle between two unstoppable forces. Good Job.***')
          .setImage('https://favna.xyz/images/ribbonhost/universeblast.png');
      } else {
        fighterEmbed
          .addField('You fokn wot m8', '***Chuck Norris cannot be beaten***')
          .setImage('https://favna.xyz/images/ribbonhost/chucknorris.png');
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fighterEmbed);
    }
    if (fighterOne.toLowerCase() === 'favna' || fighterTwo.toLowerCase() === 'favna') {
      fighterEmbed
        .addField('You got mega rekt', '***Favna always wins***')
        .setImage('https://favna.xyz/images/ribbonhost/pyrrhawins.gif');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fighterEmbed);
    }
    random.integers({number: 2}, (error, data) => {
      if (!error) {
        const fighterOneChance = parseInt(data[0], 10),
          fighterTwoChance = parseInt(data[1], 10),
          loser = Math.min(fighterOneChance, fighterTwoChance) === fighterOneChance ? fighterOne : fighterTwo,
          winner = Math.max(fighterOneChance, fighterTwoChance) === fighterOneChance ? fighterOne : fighterTwo;

        fighterEmbed
          .addField('🇼 Winner', `**${winner}**`, true)
          .addField('🇱 Loser', `**${loser}**`, true)
          .setFooter(`${winner} bodied ${loser}`)
          .setTimestamp();

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(fighterEmbed);
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred pitting these combatants against each other 😦');
    });
    stopTyping(msg);

    return null;
  }
};