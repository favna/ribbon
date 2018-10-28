/**
 * @file Games FightCommand - Pit two things against each other in a fight to the death.  
 * **Aliases**: `combat`
 * @module
 * @category games
 * @name fight
 * @example fight Pyrrha Ruby
 * @param {StringResolvable} FighterOne The first combatant
 * @param {StringResolvable} FighterTwo The second combatant
 * @returns {MessageEmbed} Result of the combat
 */

import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

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
    try {
      startTyping(msg);
      const fighterEmbed = new MessageEmbed();

      fighterOne = (/<@[0-9]{18}>/).test(fighterOne) ? msg.guild.members.get(fighterOne.slice(2, 20)).displayName : fighterOne;
      fighterTwo = (/<@[0-9]{18}>/).test(fighterTwo) ? msg.guild.members.get(fighterTwo.slice(2, 20)).displayName : fighterTwo;

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

      // eslint-disable-next-line one-var
      const fighterOneChance = Math.floor((Math.random() * 100) + 1),
        fighterTwoChance = Math.floor((Math.random() * 100) + 1),
        loser = Math.min(fighterOneChance, fighterTwoChance) === fighterOneChance ? fighterOne : fighterTwo,
        winner = Math.max(fighterOneChance, fighterTwoChance) === fighterOneChance ? fighterOne : fighterTwo;

      fighterEmbed
        .addField('🇼 Winner', `**${winner}**`, true)
        .addField('🇱 Loser', `**${loser}**`, true)
        .setFooter(`${winner} bodied ${loser} at`)
        .setTimestamp();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fighterEmbed);

    } catch (err) {
      stopTyping(msg);

      return msg.reply(`something went wrong trying to make \`${fighterOne}\` fight \`${fighterTwo}\``);
    }
  }
};