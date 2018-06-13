/* eslint-disable consistent-return, max-len, no-continue, one-var*/
const BattleAbilities = [
  {
    shortDesc: 'Does nothing.',
    id: 'noability',
    isNonstandard: 'gen2',
    name: 'No Ability',
    rating: 0.1,
    num: 0
  },
  {
    desc: 'This Pokemon\'s moves that match one of its types have a same-type attack bonus (STAB) of 2 instead of 1.5.',
    shortDesc: 'This Pokemon\'s same-type attack bonus (STAB) is 2 instead of 1.5.',
    onModifyMove (move) {
      move.stab = 2;
    },
    id: 'adaptability',
    name: 'Adaptability',
    rating: 4,
    num: 91
  },
  {
    desc: 'If this Pokemon is knocked out with a contact move, that move\'s user loses 1/4 of its maximum HP, rounded down. If any active Pokemon has the Ability Damp, this effect is prevented.',
    shortDesc: 'If this Pokemon is KOed with a contact move, that move\'s user loses 1/4 its max HP.',
    id: 'aftermath',
    name: 'Aftermath',
    onAfterDamageOrder: 1,
    onAfterDamage (target, source, move) {
      if (source && source !== target && move && move.flags.contact && !target.hp) {
        this.damage(source.maxhp / 4, source, target);
      }
    },
    rating: 2.5,
    num: 106
  },
  {
    desc: 'This Pokemon\'s Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
    shortDesc: 'This Pokemon\'s Normal-type moves become Flying type and have 1.2x power.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.type === 'Normal' && !['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'weatherball'].includes(move.id) && !(move.isZ && move.category !== 'Status')) {
        move.type = 'Flying';
        move.aerilateBoosted = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.aerilateBoosted) {
        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'aerilate',
    name: 'Aerilate',
    rating: 4,
    num: 185
  },
  {
    shortDesc: 'While this Pokemon is active, the effects of weather conditions are disabled.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Air Lock');
    },
    suppressWeather: true,
    id: 'airlock',
    name: 'Air Lock',
    rating: 2.5,
    num: 76
  },
  {
    desc: 'The power of this Pokemon\'s move is multiplied by 1.3 if it is the last to move in a turn. Does not affect Doom Desire and Future Sight.',
    shortDesc: 'This Pokemon\'s attacks have 1.3x power if it is the last to move in a turn.',
    onBasePowerPriority: 8,
    onBasePower (pokemon) {
      let boosted = true;
      const allActives = pokemon.side.active.concat(pokemon.side.foe.active);

      for (const target of allActives) {
        if (target === pokemon) {
          continue;
        }
        if (this.willMove(target)) {
          boosted = false;
          break;
        }
      }
      if (boosted) {
        this.debug('Analytic boost');

        return this.chainModify([0x14CD, 0x1000]);
      }
    },
    id: 'analytic',
    name: 'Analytic',
    rating: 2.5,
    num: 148
  },
  {
    desc: 'If this Pokemon, but not its substitute, is struck by a critical hit, its Attack is raised by 12 stages.',
    shortDesc: 'If this Pokemon (not its substitute) takes a critical hit, its Attack is raised 12 stages.',
    onHit (target, move) {
      if (!target.hp) {
        return;
      }
      if (move && move.effectType === 'Move' && move.crit) {
        target.setBoost({atk: 6});
        this.add('-setboost', target, 'atk', 12, '[from] ability: Anger Point');
      }
    },
    id: 'angerpoint',
    name: 'Anger Point',
    rating: 2,
    num: 83
  },
  {
    desc: 'On switch-in, this Pokemon is alerted if any opposing Pokemon has an attack that is super effective on this Pokemon, or an OHKO move. Counter, Metal Burst, and Mirror Coat count as attacking moves of their respective types, while Hidden Power, Judgment, Natural Gift, Techno Blast, and Weather Ball are considered Normal-type moves.',
    shortDesc: 'On switch-in, this Pokemon shudders if any foe has a supereffective or OHKO move.',
    onStart (pokemon) {
      for (const target of pokemon.side.foe.active) {
        if (target.fainted) {
          continue;
        }
        for (const moveSlot of target.moveSlots) {
          const move = this.getMove(moveSlot.move);

          if (move.category !== 'Status' && (this.getImmunity(move.type, pokemon) && this.getEffectiveness(move.type, pokemon) > 0 || move.ohko)) {
            this.add('-ability', pokemon, 'Anticipation');

            return;
          }
        }
      }
    },
    id: 'anticipation',
    name: 'Anticipation',
    rating: 1,
    num: 107
  },
  {
    desc: 'Prevents adjacent opposing Pokemon from choosing to switch out unless they are immune to trapping or are airborne.',
    shortDesc: 'Prevents adjacent foes from choosing to switch unless they are airborne.',
    onFoeTrapPokemon (pokemon) {
      if (!this.isAdjacent(pokemon, this.effectData.target)) {
        return;
      }
      if (pokemon.isGrounded()) {
        pokemon.tryTrap(true);
      }
    },
    onFoeMaybeTrapPokemon (pokemon, source) {
      if (!source) {
        source = this.effectData.target;
      }
      if (!this.isAdjacent(pokemon, source)) {
        return;
      }
      if (pokemon.isGrounded(!pokemon.knownType)) {
        pokemon.maybeTrapped = true;
      }
    },
    id: 'arenatrap',
    name: 'Arena Trap',
    rating: 4.5,
    num: 71
  },
  {
    desc: 'This Pokemon and its allies cannot be affected by Attract, Disable, Encore, Heal Block, Taunt, or Torment.',
    shortDesc: 'Protects user/allies from Attract, Disable, Encore, Heal Block, Taunt, and Torment.',
    onAllyTryAddVolatile (status, target, effect) {
      if (['attract', 'disable', 'encore', 'healblock', 'taunt', 'torment'].includes(status.id)) {
        if (effect.effectType === 'Move') {
          this.add('-activate', this.effectData.target, 'ability: Aroma Veil', `[of] ${target}`);
        }

        return null;
      }
    },
    id: 'aromaveil',
    name: 'Aroma Veil',
    rating: 1.5,
    num: 165
  },
  {
    desc: 'While this Pokemon is active, the effects of the Abilities Dark Aura and Fairy Aura are reversed, multiplying the power of Dark- and Fairy-type moves, respectively, by 3/4 instead of 1.33.',
    shortDesc: 'While this Pokemon is active, the Dark Aura and Fairy Aura power modifier is 0.75x.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Aura Break');
    },
    onAnyTryPrimaryHit (target, source, move) {
      if (target === source || move.category === 'Status') {
        return;
      }
      move.hasAuraBreak = true;
    },
    id: 'aurabreak',
    name: 'Aura Break',
    rating: 1.5,
    num: 188
  },
  {
    desc: 'Causes adjacent opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.',
    shortDesc: 'Causes sleeping adjacent foes to lose 1/8 of their max HP at the end of each turn.',
    onResidualOrder: 26,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (!pokemon.hp) {
        return;
      }
      for (const target of pokemon.side.foe.active) {
        if (!target || !target.hp) {
          continue;
        }
        if (target.status === 'slp' || target.hasAbility('comatose')) {
          this.damage(target.maxhp / 8, target, pokemon);
        }
      }
    },
    id: 'baddreams',
    name: 'Bad Dreams',
    rating: 2,
    num: 123
  },
  {
    shortDesc: 'This Pokemon\'s allies have the power of their special attacks multiplied by 1.3.',
    onBasePowerPriority: 8,
    onAllyBasePower (attacker, move) {
      if (attacker !== this.effectData.target && move.category === 'Special') {
        this.debug('Battery boost');

        return this.chainModify([0x14CD, 0x1000]);
      }
    },
    id: 'battery',
    name: 'Battery',
    rating: 0,
    num: 217
  },
  {
    shortDesc: 'This Pokemon cannot be struck by a critical hit.',
    onCriticalHit: false,
    id: 'battlearmor',
    name: 'Battle Armor',
    rating: 1,
    num: 4
  },
  {
    desc: 'If this Pokemon is a Greninja, it transforms into Ash-Greninja after knocking out a Pokemon. As Ash-Greninja, its Water Shuriken has 20 base power and always hits 3 times.',
    shortDesc: 'After KOing a Pokemon: becomes Ash-Greninja, Water Shuriken: 20 power, hits 3x.',
    onSourceFaint (source, effect) {
      if (effect && effect.effectType === 'Move' && source.template.speciesid === 'greninja' && source.hp && !source.transformed && source.side.foe.pokemonLeft) {
        this.add('-activate', source, 'ability: Battle Bond');
        source.formeChange('Greninja-Ash', this.effect, true);
      }
    },
    onModifyMovePriority: -1,
    onModifyMove (move, attacker) {
      if (move.id === 'watershuriken' && attacker.template.species === 'Greninja-Ash') {
        move.multihit = 3;
      }
    },
    id: 'battlebond',
    name: 'Battle Bond',
    rating: 3,
    num: 210
  },
  {
    desc: 'This Pokemon\'s highest stat is raised by 1 stage if it attacks and knocks out another Pokemon.',
    shortDesc: 'This Pokemon\'s highest stat is raised by 1 if it attacks and KOes another Pokemon.',
    onSourceFaint (source, effect) {
      if (effect && effect.effectType === 'Move') {
        let stat = 'atk';
        let bestStat = 0;

        for (const i in source.stats) {
          if (source.stats[i] > bestStat) {
            stat = i;
            bestStat = source.stats[i];
          }
        }
        this.boost({[stat]: 1}, source);
      }
    },
    id: 'beastboost',
    name: 'Beast Boost',
    rating: 3.5,
    num: 224
  },
  {
    desc: 'When this Pokemon has more than 1/2 its maximum HP and takes damage from an attack bringing it to 1/2 or less of its maximum HP, its Special Attack is raised by 1 stage. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect.',
    shortDesc: 'This Pokemon\'s Sp. Atk is raised by 1 when it reaches 1/2 or less of its max HP.',
    onAfterMoveSecondary (target, source, move) {
      if (!source || source === target || !target.hp || !move.totalDamage) {
        return;
      }
      if (target.hp <= target.maxhp / 2 && target.hp + move.totalDamage > target.maxhp / 2) {
        this.boost({spa: 1});
      }
    },
    id: 'berserk',
    name: 'Berserk',
    rating: 2.5,
    num: 201
  },
  {
    shortDesc: 'Prevents other Pokemon from lowering this Pokemon\'s Defense stat stage.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      if (boost.def && boost.def < 0) {
        delete boost.def;
        if (!effect.secondaries) {
          this.add('-fail', target, 'unboost', 'Defense', '[from] ability: Big Pecks', `[of] ${target}`);
        }
      }
    },
    id: 'bigpecks',
    name: 'Big Pecks',
    rating: 0.5,
    num: 145
  },
  {
    desc: 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Fire-type attack.',
    shortDesc: 'At 1/3 or less of its max HP, this Pokemon\'s attacking stat is 1.5x with Fire attacks.',
    onModifyAtkPriority: 5,
    onModifyAtk (attacker, move) {
      if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Blaze boost');

        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (attacker, move) {
      if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Blaze boost');

        return this.chainModify(1.5);
      }
    },
    id: 'blaze',
    name: 'Blaze',
    rating: 2,
    num: 66
  },
  {
    desc: 'This Pokemon is immune to ballistic moves. Ballistic moves include Bullet Seed, Octazooka, Barrage, Rock Wrecker, Zap Cannon, Acid Spray, Aura Sphere, Focus Blast, and all moves with Ball or Bomb in their name.',
    shortDesc: 'Makes user immune to ballistic moves (Shadow Ball, Sludge Bomb, Focus Blast, etc).',
    onTryHit (pokemon, move) {
      if (move.flags.bullet) {
        this.add('-immune', pokemon, '[msg]', '[from] ability: Bulletproof');

        return null;
      }
    },
    id: 'bulletproof',
    name: 'Bulletproof',
    rating: 3.5,
    num: 171
  },
  {
    desc: 'If this Pokemon eats a Berry, it restores 1/3 of its maximum HP, rounded down, in addition to the Berry\'s effect.',
    shortDesc: 'If this Pokemon eats a Berry, it restores 1/3 of its max HP after the Berry\'s effect.',
    onEatItem (pokemon) {
      this.heal(pokemon.maxhp / 3);
    },
    id: 'cheekpouch',
    name: 'Cheek Pouch',
    rating: 2,
    num: 167
  },
  {
    shortDesc: 'If Sunny Day is active, this Pokemon\'s Speed is doubled.',
    onModifySpe () {
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        return this.chainModify(2);
      }
    },
    id: 'chlorophyll',
    name: 'Chlorophyll',
    rating: 3,
    num: 34
  },
  {
    shortDesc: 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      let showMsg = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          delete boost[i];
          showMsg = true;
        }
      }
      if (showMsg && !effect.secondaries) {
        this.add('-fail', target, 'unboost', '[from] ability: Clear Body', `[of] ${target}`);
      }
    },
    id: 'clearbody',
    name: 'Clear Body',
    rating: 2,
    num: 29
  },
  {
    shortDesc: 'While this Pokemon is active, the effects of weather conditions are disabled.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Cloud Nine');
    },
    suppressWeather: true,
    id: 'cloudnine',
    name: 'Cloud Nine',
    rating: 2.5,
    num: 13
  },
  {
    desc: 'This Pokemon\'s type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect.',
    shortDesc: 'This Pokemon\'s type changes to the type of a move it\'s hit by, unless it has the type.',
    id: 'colorchange',
    name: 'Color Change',
    rating: 1,
    num: 16
  },
  {
    desc: 'This Pokemon cannot be statused, and is considered to be asleep. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability.',
    shortDesc: 'This Pokemon cannot be statused, and is considered to be asleep.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Comatose');
    },
    onSetStatus (target, effect) {
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Comatose');

      return false;
    },

    isUnbreakable: true,
    id: 'comatose',
    name: 'Comatose',
    rating: 3,
    num: 213
  },
  {
    desc: 'This Pokemon\'s Special Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.',
    shortDesc: 'This Pokemon\'s Sp. Atk is raised by 2 for each of its stats that is lowered by a foe.',
    onAfterEachBoost (boost, target, source) {
      if (!source || target.side === source.side) {
        return;
      }
      let statsLowered = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          statsLowered = true;
        }
      }
      if (statsLowered) {
        this.boost({spa: 2}, target, target, null, true);
      }
    },
    id: 'competitive',
    name: 'Competitive',
    rating: 2.5,
    num: 172
  },
  {
    shortDesc: 'This Pokemon\'s moves have their accuracy multiplied by 1.3.',
    onSourceModifyAccuracy (accuracy) {
      if (typeof accuracy !== 'number') {
        return;
      }
      this.debug('compoundeyes - enhancing accuracy');

      return accuracy * 1.3;
    },
    id: 'compoundeyes',
    name: 'Compound Eyes',
    rating: 3.5,
    num: 14
  },
  {
    shortDesc: 'If this Pokemon has a stat stage raised it is lowered instead, and vice versa.',
    onBoost (boost, effect) {
      if (effect && effect.id === 'zpower') {
        return;
      }
      for (const i in boost) {
        boost[i] *= -1;
      }
    },
    id: 'contrary',
    name: 'Contrary',
    rating: 4,
    num: 126
  },
  {
    shortDesc: 'This Pokemon can poison or badly poison other Pokemon regardless of their typing.',

    id: 'corrosion',
    name: 'Corrosion',
    rating: 2.5,
    num: 212
  },
  {
    desc: 'If this Pokemon is hit by an attack, there is a 30% chance that move gets disabled unless one of the attacker\'s moves is already disabled.',
    shortDesc: 'If this Pokemon is hit by an attack, there is a 30% chance that move gets disabled.',
    onAfterDamage (target, source, move) {
      if (!source || source.volatiles.disable) {
        return;
      }
      if (source !== target && move && move.effectType === 'Move' && !move.isFutureMove) {
        if (this.randomChance(3, 10)) {
          source.addVolatile('disable', this.effectData.target);
        }
      }
    },
    id: 'cursedbody',
    name: 'Cursed Body',
    rating: 2,
    num: 130
  },
  {
    desc: 'There is a 30% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender.',
    shortDesc: '30% chance of infatuating Pokemon of the opposite gender if they make contact.',
    onAfterDamage (source, move) {
      if (move && move.flags.contact) {
        if (this.randomChance(3, 10)) {
          source.addVolatile('attract', this.effectData.target);
        }
      }
    },
    id: 'cutecharm',
    name: 'Cute Charm',
    rating: 1,
    num: 56
  },
  {
    desc: 'While this Pokemon is active, Explosion, Mind Blown, Self-Destruct, and the Ability Aftermath are prevented from having an effect.',
    shortDesc: 'Prevents Explosion/Mind Blown/Self-Destruct/Aftermath while this Pokemon is active.',
    id: 'damp',
    onAnyTryMove (target, effect) {
      if (['explosion', 'mindblown', 'selfdestruct'].includes(effect.id)) {
        this.attrLastMove('[still]');
        this.add('cant', this.effectData.target, 'ability: Damp', effect, `[of] ${target}`);

        return false;
      }
    },
    onAnyDamage (effect) {
      if (effect && effect.id === 'aftermath') {
        return false;
      }
    },
    name: 'Damp',
    rating: 1,
    num: 6
  },
  {
    desc: 'After another Pokemon uses a dance move, this Pokemon uses the same move. Moves used by this Ability cannot be copied again.',
    shortDesc: 'After another Pokemon uses a dance move, this Pokemon uses the same move.',
    id: 'dancer',
    name: 'Dancer',

    rating: 2.5,
    num: 216
  },
  {
    desc: 'While this Pokemon is active, the power of Dark-type moves used by active Pokemon is multiplied by 1.33.',
    shortDesc: 'While this Pokemon is active, a Dark move used by any Pokemon has 1.33x power.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Dark Aura');
    },
    onAnyBasePower (source, target, move) {
      if (target === source || move.category === 'Status' || move.type !== 'Dark') {
        return;
      }
      if (!move.auraBooster) {
        move.auraBooster = this.effectData.target;
      }
      if (move.auraBooster !== this.effectData.target) {
        return;
      }

      return this.chainModify([move.hasAuraBreak ? 0x0C00 : 0x1547, 0x1000]);
    },
    isUnbreakable: true,
    id: 'darkaura',
    name: 'Dark Aura',
    rating: 3,
    num: 186
  },
  {
    desc: 'While this Pokemon is active, priority moves from opposing Pokemon targeted at allies are prevented from having an effect.',
    shortDesc: 'While this Pokemon is active, allies are protected from opposing priority moves.',
    onFoeTryMove (target, source, effect) {
      if ((source.side === this.effectData.target.side || effect.id === 'perishsong') && effect.priority > 0.1 && effect.target !== 'foeSide') {
        this.attrLastMove('[still]');
        this.add('cant', this.effectData.target, 'ability: Dazzling', effect, `[of] ${target}`);

        return false;
      }
    },
    id: 'dazzling',
    name: 'Dazzling',
    rating: 3,
    num: 219
  },
  {
    desc: 'While this Pokemon has 1/2 or less of its maximum HP, its Attack and Special Attack are halved.',
    shortDesc: 'While this Pokemon has 1/2 or less of its max HP, its Attack and Sp. Atk are halved.',
    onModifyAtkPriority: 5,
    onModifyAtk (pokemon) {
      if (pokemon.hp <= pokemon.maxhp / 2) {
        return this.chainModify(0.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (pokemon) {
      if (pokemon.hp <= pokemon.maxhp / 2) {
        return this.chainModify(0.5);
      }
    },
    id: 'defeatist',
    name: 'Defeatist',
    rating: -1,
    num: 129
  },
  {
    desc: 'This Pokemon\'s Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.',
    shortDesc: 'This Pokemon\'s Attack is raised by 2 for each of its stats that is lowered by a foe.',
    onAfterEachBoost (boost, target, source) {
      if (!source || target.side === source.side) {
        return;
      }
      let statsLowered = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          statsLowered = true;
        }
      }
      if (statsLowered) {
        this.boost({atk: 2}, target, target, null, true);
      }
    },
    id: 'defiant',
    name: 'Defiant',
    rating: 2.5,
    num: 128
  },
  {
    desc: 'On switch-in, the weather becomes strong winds that remove the weaknesses of the Flying type from Flying-type Pokemon. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Desolate Land or Primordial Sea.',
    shortDesc: 'On switch-in, strong winds begin until this Ability is not active in battle.',
    onStart () {
      this.setWeather('deltastream');
    },
    onAnySetWeather (weather) {
      if (this.getWeather().id === 'deltastream' && !['desolateland', 'primordialsea', 'deltastream'].includes(weather.id)) {
        return false;
      }
    },
    onEnd (pokemon) {
      if (this.weatherData.source !== pokemon) {
        return;
      }
      for (const side of this.sides) {
        for (const target of side.active) {
          if (target === pokemon) {
            continue;
          }
          if (target && target.hp && target.hasAbility('deltastream')) {
            this.weatherData.source = target;

            return;
          }
        }
      }
      this.clearWeather();
    },
    id: 'deltastream',
    name: 'Delta Stream',
    rating: 5,
    num: 191
  },
  {
    desc: 'On switch-in, the weather becomes extremely harsh sunlight that prevents damaging Water-type moves from executing, in addition to all the effects of Sunny Day. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Delta Stream or Primordial Sea.',
    shortDesc: 'On switch-in, extremely harsh sunlight begins until this Ability is not active in battle.',
    onStart () {
      this.setWeather('desolateland');
    },
    onAnySetWeather (weather) {
      if (this.getWeather().id === 'desolateland' && !['desolateland', 'primordialsea', 'deltastream'].includes(weather.id)) {
        return false;
      }
    },
    onEnd (pokemon) {
      if (this.weatherData.source !== pokemon) {
        return;
      }
      for (const side of this.sides) {
        for (const target of side.active) {
          if (target === pokemon) {
            continue;
          }
          if (target && target.hp && target.hasAbility('desolateland')) {
            this.weatherData.source = target;

            return;
          }
        }
      }
      this.clearWeather();
    },
    id: 'desolateland',
    name: 'Desolate Land',
    rating: 5,
    num: 190
  },
  {
    desc: 'If this Pokemon is a Mimikyu, the first hit it takes in battle deals 0 neutral damage. Its disguise is then broken and it changes to Busted Form. Confusion damage also breaks the disguise.',
    shortDesc: 'If this Pokemon is a Mimikyu, the first hit it takes in battle deals 0 neutral damage.',
    onDamagePriority: 1,
    onDamage (target, effect) {
      if (effect && effect.effectType === 'Move' && ['mimikyu', 'mimikyutotem'].includes(target.template.speciesid) && !target.transformed) {
        this.add('-activate', target, 'ability: Disguise');
        this.effectData.busted = true;

        return 0;
      }
    },
    onEffectiveness (move) {
      if (!this.activeTarget) {
        return;
      }
      const pokemon = this.activeTarget;

      if (!['mimikyu', 'mimikyutotem'].includes(pokemon.template.speciesid) || pokemon.transformed || (pokemon.volatiles.substitute && !(move.flags.authentic || move.infiltrates))) {
        return;
      }
      if (!pokemon.runImmunity(move.type)) {
        return;
      }

      return 0;
    },
    onUpdate (pokemon) {
      if (['mimikyu', 'mimikyutotem'].includes(pokemon.template.speciesid) && this.effectData.busted) {
        const templateid = pokemon.template.speciesid === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';

        pokemon.formeChange(templateid, this.effect, true);
      }
    },
    id: 'disguise',
    name: 'Disguise',
    rating: 4,
    num: 209
  },
  {
    desc: 'On switch-in, this Pokemon\'s Attack or Special Attack is raised by 1 stage based on the weaker combined defensive stat of all opposing Pokemon. Attack is raised if their Defense is lower, and Special Attack is raised if their Special Defense is the same or lower.',
    shortDesc: 'On switch-in, Attack or Sp. Atk is raised 1 stage based on the foes\' weaker Defense.',
    onStart (pokemon) {
      let totaldef = 0;
      let totalspd = 0;

      for (const target of pokemon.side.foe.active) {
        if (!target || target.fainted) {
          continue;
        }
        totaldef += target.getStat('def', false, true);
        totalspd += target.getStat('spd', false, true);
      }
      if (totaldef && totaldef >= totalspd) {
        this.boost({spa: 1});
      } else if (totalspd) {
        this.boost({atk: 1});
      }
    },
    id: 'download',
    name: 'Download',
    rating: 4,
    num: 88
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Rain Dance.',
    onStart (source) {
      for (const action of this.queue) {
        if (action.choice === 'runPrimal' && action.pokemon === source && source.template.speciesid === 'kyogre') {
          return;
        }
        if (action.choice !== 'runSwitch' && action.choice !== 'runPrimal') {
          break;
        }
      }
      this.setWeather('raindance');
    },
    id: 'drizzle',
    name: 'Drizzle',
    rating: 4.5,
    num: 2
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Sunny Day.',
    onStart (source) {
      for (const action of this.queue) {
        if (action.choice === 'runPrimal' && action.pokemon === source && source.template.speciesid === 'groudon') {
          return;
        }
        if (action.choice !== 'runSwitch' && action.choice !== 'runPrimal') {
          break;
        }
      }
      this.setWeather('sunnyday');
    },
    id: 'drought',
    name: 'Drought',
    rating: 4.5,
    num: 70
  },
  {
    desc: 'This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move. The power of Fire-type moves is multiplied by 1.25 when used on this Pokemon. At the end of each turn, this Pokemon restores 1/8 of its maximum HP, rounded down, if the weather is Rain Dance, and loses 1/8 of its maximum HP, rounded down, if the weather is Sunny Day.',
    shortDesc: 'This Pokemon is healed 1/4 by Water, 1/8 by Rain; is hurt 1.25x by Fire, 1/8 by Sun.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Water') {
        if (!this.heal(target.maxhp / 4)) {
          this.add('-immune', target, '[msg]', '[from] ability: Dry Skin');
        }

        return null;
      }
    },
    onBasePowerPriority: 7,
    onFoeBasePower (defender, move) {
      if (this.effectData.target !== defender) {
        return;
      }
      if (move.type === 'Fire') {
        return this.chainModify(1.25);
      }
    },
    onWeather (target, effect) {
      if (effect.id === 'raindance' || effect.id === 'primordialsea') {
        this.heal(target.maxhp / 8);
      } else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
        this.damage(target.maxhp / 8, target, target);
      }
    },
    id: 'dryskin',
    name: 'Dry Skin',
    rating: 3,
    num: 87
  },
  {
    shortDesc: 'This Pokemon\'s sleep counter drops by 2 instead of 1.',
    id: 'earlybird',
    name: 'Early Bird',

    rating: 2,
    num: 48
  },
  {
    desc: '30% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep.',
    shortDesc: '30% chance of poison/paralysis/sleep on others making contact with this Pokemon.',
    onAfterDamage (target, source, move) {
      if (move && move.flags.contact && !source.status && source.runStatusImmunity('powder')) {
        const r = this.random(100);

        if (r < 11) {
          source.setStatus('slp', target);
        } else if (r < 21) {
          source.setStatus('par', target);
        } else if (r < 30) {
          source.setStatus('psn', target);
        }
      }
    },
    id: 'effectspore',
    name: 'Effect Spore',
    rating: 2,
    num: 27
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Electric Terrain.',
    onStart () {
      this.setTerrain('electricterrain');
    },
    id: 'electricsurge',
    name: 'Electric Surge',
    rating: 4,
    num: 226
  },
  {
    desc: 'When this Pokemon has more than 1/2 its maximum HP and takes damage bringing it to 1/2 or less of its maximum HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage.',
    shortDesc: 'This Pokemon switches out when it reaches 1/2 or less of its maximum HP.',
    onAfterMoveSecondary (target, source, move) {
      if (!source || source === target || !target.hp || !move.totalDamage) {
        return;
      }
      if (target.hp <= target.maxhp / 2 && target.hp + move.totalDamage > target.maxhp / 2) {
        if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) {
          return;
        }
        target.switchFlag = true;
        source.switchFlag = false;
        this.add('-activate', target, 'ability: Emergency Exit');
      }
    },
    onAfterDamage (damage, target, effect) {
      if (!target.hp || effect.effectType === 'Move') {
        return;
      }
      if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
        if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) {
          return;
        }
        target.switchFlag = true;
        this.add('-activate', target, 'ability: Emergency Exit');
      }
    },
    id: 'emergencyexit',
    name: 'Emergency Exit',
    rating: 2,
    num: 194
  },
  {
    desc: 'While this Pokemon is active, the power of Fairy-type moves used by active Pokemon is multiplied by 1.33.',
    shortDesc: 'While this Pokemon is active, a Fairy move used by any Pokemon has 1.33x power.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Fairy Aura');
    },
    onAnyBasePower (source, target, move) {
      if (target === source || move.category === 'Status' || move.type !== 'Fairy') {
        return;
      }
      if (!move.auraBooster) {
        move.auraBooster = this.effectData.target;
      }
      if (move.auraBooster !== this.effectData.target) {
        return;
      }

      return this.chainModify([move.hasAuraBreak ? 0x0C00 : 0x1547, 0x1000]);
    },
    isUnbreakable: true,
    id: 'fairyaura',
    name: 'Fairy Aura',
    rating: 3,
    num: 187
  },
  {
    shortDesc: 'This Pokemon receives 3/4 damage from supereffective attacks.',
    onSourceModifyDamage (move) {
      if (move.typeMod > 0) {
        this.debug('Filter neutralize');

        return this.chainModify(0.75);
      }
    },
    id: 'filter',
    name: 'Filter',
    rating: 3,
    num: 111
  },
  {
    shortDesc: '30% chance a Pokemon making contact with this Pokemon will be burned.',
    onAfterDamage (target, source, move) {
      if (move && move.flags.contact) {
        if (this.randomChance(3, 10)) {
          source.trySetStatus('brn', target);
        }
      }
    },
    id: 'flamebody',
    name: 'Flame Body',
    rating: 2,
    num: 49
  },
  {
    desc: 'While this Pokemon is burned, the power of its special attacks is multiplied by 1.5.',
    shortDesc: 'While this Pokemon is burned, its special attacks have 1.5x power.',
    onBasePowerPriority: 8,
    onBasePower (attacker, move) {
      if (attacker.status === 'brn' && move.category === 'Special') {
        return this.chainModify(1.5);
      }
    },
    id: 'flareboost',
    name: 'Flare Boost',
    rating: 2.5,
    num: 138
  },
  {
    desc: 'This Pokemon is immune to Fire-type moves. The first time it is hit by a Fire-type move, its attacking stat is multiplied by 1.5 while using a Fire-type attack as long as it remains active and has this Ability. If this Pokemon is frozen, it cannot be defrosted by Fire-type attacks.',
    shortDesc: 'This Pokemon\'s Fire attacks do 1.5x damage if hit by one Fire move; Fire immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Fire') {
        move.accuracy = true;
        if (!target.addVolatile('flashfire')) {
          this.add('-immune', target, '[msg]', '[from] ability: Flash Fire');
        }

        return null;
      }
    },
    onEnd (pokemon) {
      pokemon.removeVolatile('flashfire');
    },
    effect: {
      noCopy: true,
      onStart (target) {
        this.add('-start', target, 'ability: Flash Fire');
      },
      onModifyAtkPriority: 5,
      onModifyAtk (move) {
        if (move.type === 'Fire') {
          this.debug('Flash Fire boost');

          return this.chainModify(1.5);
        }
      },
      onModifySpAPriority: 5,
      onModifySpA (move) {
        if (move.type === 'Fire') {
          this.debug('Flash Fire boost');

          return this.chainModify(1.5);
        }
      },
      onEnd (target) {
        this.add('-end', target, 'ability: Flash Fire', '[silent]');
      }
    },
    id: 'flashfire',
    name: 'Flash Fire',
    rating: 3,
    num: 18
  },
  {
    desc: 'If this Pokemon is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5.',
    shortDesc: 'If user is Cherrim and Sunny Day is active, it and allies\' Attack and Sp. Def are 1.5x.',
    onStart () {
      delete this.effectData.forme;
    },
    onUpdate (pokemon) {
      if (!pokemon.isActive || pokemon.baseTemplate.baseSpecies !== 'Cherrim' || pokemon.transformed) {
        return;
      }
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        if (pokemon.template.speciesid !== 'cherrimsunshine') {
          pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '[msg]');
        }
      } else if (pokemon.template.speciesid === 'cherrimsunshine') {
        pokemon.formeChange('Cherrim', this.effect, false, '[msg]');
      }
    },
    onModifyAtkPriority: 3,
    onAllyModifyAtk () {
      if (this.effectData.target.baseTemplate.baseSpecies !== 'Cherrim') {
        return;
      }
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        return this.chainModify(1.5);
      }
    },
    onModifySpDPriority: 4,
    onAllyModifySpD () {
      if (this.effectData.target.baseTemplate.baseSpecies !== 'Cherrim') {
        return;
      }
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        return this.chainModify(1.5);
      }
    },
    id: 'flowergift',
    name: 'Flower Gift',
    rating: 2.5,
    num: 122
  },
  {
    desc: 'Grass-type Pokemon on this Pokemon\'s side cannot have their stat stages lowered by other Pokemon or have a major status condition inflicted on them by other Pokemon.',
    shortDesc: 'This side\'s Grass types can\'t have stats lowered or status inflicted by other Pokemon.',
    onAllyBoost (boost, target, source, effect) {
      if ((source && target === source) || !target.hasType('Grass')) {
        return;
      }
      let showMsg = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          delete boost[i];
          showMsg = true;
        }
      }
      if (showMsg && !effect.secondaries) {
        this.add('-fail', this.effectData.target, 'unboost', '[from] ability: Flower Veil', `[of] ${target}`);
      }
    },
    onAllySetStatus (target, effect) {
      if (target.hasType('Grass')) {
        if (!effect || !effect.status) {
          return false;
        }
        this.add('-activate', this.effectData.target, 'ability: Flower Veil', `[of] ${target}`);

        return null;
      }
    },
    id: 'flowerveil',
    name: 'Flower Veil',
    rating: 0,
    num: 166
  },
  {
    desc: 'This Pokemon receives 1/2 damage from contact moves, but double damage from Fire moves.',
    shortDesc: 'This Pokemon takes 1/2 damage from contact moves, 2x damage from Fire moves.',
    onSourceModifyDamage (move) {
      let mod = 1;

      if (move.type === 'Fire') {
        mod *= 2;
      }
      if (move.flags.contact) {
        mod /= 2;
      }

      return this.chainModify(mod);
    },
    id: 'fluffy',
    name: 'Fluffy',
    rating: 2.5,
    num: 218
  },
  {
    desc: 'If this Pokemon is a Castform, its type changes to the current weather condition\'s type, except Sandstorm.',
    shortDesc: 'Castform\'s type changes to the current weather condition\'s type, except Sandstorm.',
    onUpdate (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Castform' || pokemon.transformed) {
        return;
      }
      let forme = null;

      switch (this.effectiveWeather()) {
      case 'sunnyday':
      case 'desolateland':
        if (pokemon.template.speciesid !== 'castformsunny') {
          forme = 'Castform-Sunny';
        }
        break;
      case 'raindance':
      case 'primordialsea':
        if (pokemon.template.speciesid !== 'castformrainy') {
          forme = 'Castform-Rainy';
        }
        break;
      case 'hail':
        if (pokemon.template.speciesid !== 'castformsnowy') {
          forme = 'Castform-Snowy';
        }
        break;
      default:
        if (pokemon.template.speciesid !== 'castform') {
          forme = 'Castform';
        }
        break;
      }
      if (pokemon.isActive && forme) {
        pokemon.formeChange(forme, this.effect, false, '[msg]');
      }
    },
    id: 'forecast',
    name: 'Forecast',
    rating: 3,
    num: 59
  },
  {
    desc: 'On switch-in, this Pokemon is alerted to the move with the highest power, at random, known by an opposing Pokemon.',
    shortDesc: 'On switch-in, this Pokemon is alerted to the foes\' move with the highest power.',
    onStart (pokemon) {
      let warnMoves = [];
      let warnBp = 1;

      for (const target of pokemon.side.foe.active) {
        if (target.fainted) {
          continue;
        }
        for (const moveSlot of target.moveSlots) {
          const move = this.getMove(moveSlot.move);
          let bp = move.basePower;

          if (move.ohko) {
            bp = 160;
          }
          if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') {
            bp = 120;
          }
          if (!bp && move.category !== 'Status') {
            bp = 80;
          }
          if (bp > warnBp) {
            warnMoves = [[move, target]];
            warnBp = bp;
          } else if (bp === warnBp) {
            warnMoves.push([move, target]);
          }
        }
      }
      if (!warnMoves.length) {
        return;
      }
      const [warnMoveName, warnTarget] = this.sample(warnMoves);

      this.add('-activate', pokemon, 'ability: Forewarn', warnMoveName, `[of] ${warnTarget}`);
    },
    id: 'forewarn',
    name: 'Forewarn',
    rating: 1,
    num: 108
  },
  {
    shortDesc: 'This Pokemon\'s allies receive 3/4 damage from other Pokemon\'s attacks.',
    id: 'friendguard',
    name: 'Friend Guard',
    onAnyModifyDamage (target) {
      if (target !== this.effectData.target && target.side === this.effectData.target.side) {
        this.debug('Friend Guard weaken');

        return this.chainModify(0.75);
      }
    },
    rating: 0,
    num: 132
  },
  {
    shortDesc: 'On switch-in, this Pokemon identifies the held items of all opposing Pokemon.',
    onStart (pokemon) {
      for (const target of pokemon.side.foe.active) {
        if (!target || target.fainted) {
          continue;
        }
        if (target.item) {
          this.add('-item', target, target.getItem().name, '[from] ability: Frisk', `[of] ${pokemon}`, '[identify]');
        }
      }
    },
    id: 'frisk',
    name: 'Frisk',
    rating: 1.5,
    num: 119
  },
  {
    desc: 'Prevents other Pokemon from lowering this Pokemon\'s stat stages. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability.',
    shortDesc: 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      let showMsg = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          delete boost[i];
          showMsg = true;
        }
      }
      if (showMsg && !effect.secondaries) {
        this.add('-fail', target, 'unboost', '[from] ability: Full Metal Body', `[of] ${target}`);
      }
    },
    isUnbreakable: true,
    id: 'fullmetalbody',
    name: 'Full Metal Body',
    rating: 2,
    num: 230
  },
  {
    shortDesc: 'This Pokemon\'s Defense is doubled.',
    onModifyDefPriority: 6,
    onModifyDef () {
      return this.chainModify(2);
    },
    id: 'furcoat',
    name: 'Fur Coat',
    rating: 3.5,
    num: 169
  },
  {
    shortDesc: 'If this Pokemon is at full HP, its Flying-type moves have their priority increased by 1.',
    onModifyPriority (priority, pokemon, move) {
      if (move && move.type === 'Flying' && pokemon.hp === pokemon.maxhp) {
        return priority + 1;
      }
    },
    id: 'galewings',
    name: 'Gale Wings',
    rating: 3,
    num: 177
  },
  {
    desc: 'This Pokemon\'s Normal-type moves become Electric-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
    shortDesc: 'This Pokemon\'s Normal-type moves become Electric type and have 1.2x power.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.type === 'Normal' && !['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'weatherball'].includes(move.id) && !(move.isZ && move.category !== 'Status')) {
        move.type = 'Electric';
        move.galvanizeBoosted = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.galvanizeBoosted) {
        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'galvanize',
    name: 'Galvanize',
    rating: 4,
    num: 206
  },
  {
    shortDesc: 'When this Pokemon has 1/2 or less of its maximum HP, it uses certain Berries early.',
    id: 'gluttony',
    name: 'Gluttony',
    rating: 1.5,
    num: 82
  },
  {
    shortDesc: 'Pokemon making contact with this Pokemon have their Speed lowered by 1 stage.',
    onAfterDamage (target, source, effect) {
      if (effect && effect.flags.contact) {
        this.add('-ability', target, 'Gooey');
        this.boost({spe: -1}, source, target, null, true);
      }
    },
    id: 'gooey',
    name: 'Gooey',
    rating: 2.5,
    num: 183
  },
  {
    shortDesc: 'If Grassy Terrain is active, this Pokemon\'s Defense is multiplied by 1.5.',
    onModifyDefPriority: 6,
    onModifyDef () {
      if (this.isTerrain('grassyterrain')) {
        return this.chainModify(1.5);
      }
    },
    id: 'grasspelt',
    name: 'Grass Pelt',
    rating: 1,
    num: 179
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Grassy Terrain.',
    onStart () {
      this.setTerrain('grassyterrain');
    },
    id: 'grassysurge',
    name: 'Grassy Surge',
    rating: 4,
    num: 229
  },
  {
    desc: 'If this Pokemon has a major status condition, its Attack is multiplied by 1.5; burn\'s physical damage halving is ignored.',
    shortDesc: 'If this Pokemon is statused, its Attack is 1.5x; ignores burn halving physical damage.',
    onModifyAtkPriority: 5,
    onModifyAtk (pokemon) {
      if (pokemon.status) {
        return this.chainModify(1.5);
      }
    },
    id: 'guts',
    name: 'Guts',
    rating: 3,
    num: 62
  },
  {
    desc: 'If the last item this Pokemon used is a Berry, there is a 50% chance it gets restored at the end of each turn. If Sunny Day is active, this chance is 100%.',
    shortDesc: 'If last item used is a Berry, 50% chance to restore it each end of turn. 100% in Sun.',
    id: 'harvest',
    name: 'Harvest',
    onResidualOrder: 26,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (this.isWeather(['sunnyday', 'desolateland']) || this.randomChance(1, 2)) {
        if (pokemon.hp && !pokemon.item && this.getItem(pokemon.lastItem).isBerry) {
          pokemon.setItem(pokemon.lastItem);
          pokemon.lastItem = '';
          this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Harvest');
        }
      }
    },
    rating: 2.5,
    num: 139
  },
  {
    desc: 'There is a 30% chance of curing an adjacent ally\'s major status condition at the end of each turn.',
    shortDesc: '30% chance of curing an adjacent ally\'s status at the end of each turn.',
    id: 'healer',
    name: 'Healer',
    onResidualOrder: 5,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (pokemon.side.active.length === 1) {
        return;
      }
      for (const allyActive of pokemon.side.active) {
        if (allyActive && allyActive.hp && this.isAdjacent(pokemon, allyActive) && allyActive.status && this.randomChance(3, 10)) {
          this.add('-activate', pokemon, 'ability: Healer');
          allyActive.cureStatus();
        }
      }
    },
    rating: 0,
    num: 131
  },
  {
    desc: 'The power of Fire-type attacks against this Pokemon is halved, and burn damage taken is halved.',
    shortDesc: 'The power of Fire-type attacks against this Pokemon is halved; burn damage halved.',
    onBasePowerPriority: 7,
    onSourceBasePower (move) {
      if (move.type === 'Fire') {
        return this.chainModify(0.5);
      }
    },
    onDamage (damage, effect) {
      if (effect && effect.id === 'brn') {
        return damage / 2;
      }
    },
    id: 'heatproof',
    name: 'Heatproof',
    rating: 2.5,
    num: 85
  },
  {
    shortDesc: 'This Pokemon\'s weight is doubled.',
    onModifyWeight (weight) {
      return weight * 2;
    },
    id: 'heavymetal',
    name: 'Heavy Metal',
    rating: -1,
    num: 134
  },
  {
    shortDesc: 'No competitive use.',
    id: 'honeygather',
    name: 'Honey Gather',
    rating: 0,
    num: 118
  },
  {
    shortDesc: 'This Pokemon\'s Attack is doubled.',
    onModifyAtkPriority: 5,
    onModifyAtk () {
      return this.chainModify(2);
    },
    id: 'hugepower',
    name: 'Huge Power',
    rating: 5,
    num: 37
  },
  {
    desc: 'This Pokemon\'s Attack is multiplied by 1.5 and the accuracy of its physical attacks is multiplied by 0.8.',
    shortDesc: 'This Pokemon\'s Attack is 1.5x and accuracy of its physical attacks is 0.8x.',

    onModifyAtkPriority: 5,
    onModifyAtk (atk) {
      return this.modify(atk, 1.5);
    },
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.category === 'Physical' && typeof move.accuracy === 'number') {
        move.accuracy *= 0.8;
      }
    },
    id: 'hustle',
    name: 'Hustle',
    rating: 3,
    num: 55
  },
  {
    desc: 'This Pokemon has its major status condition cured at the end of each turn if Rain Dance is active.',
    shortDesc: 'This Pokemon has its status cured at the end of each turn if Rain Dance is active.',
    onResidualOrder: 5,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (pokemon.status && this.isWeather(['raindance', 'primordialsea'])) {
        this.debug('hydration');
        this.add('-activate', pokemon, 'ability: Hydration');
        pokemon.cureStatus();
      }
    },
    id: 'hydration',
    name: 'Hydration',
    rating: 2,
    num: 93
  },
  {
    shortDesc: 'Prevents other Pokemon from lowering this Pokemon\'s Attack stat stage.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      if (boost.atk && boost.atk < 0) {
        delete boost.atk;
        if (!effect.secondaries) {
          this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Hyper Cutter', `[of] ${target}`);
        }
      }
    },
    id: 'hypercutter',
    name: 'Hyper Cutter',
    rating: 1.5,
    num: 52
  },
  {
    desc: 'If Hail is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from Hail.',
    shortDesc: 'If Hail is active, this Pokemon heals 1/16 of its max HP each turn; immunity to Hail.',
    onWeather (target, effect) {
      if (effect.id === 'hail') {
        this.heal(target.maxhp / 16);
      }
    },
    onImmunity (type) {
      if (type === 'hail') {
        return false;
      }
    },
    id: 'icebody',
    name: 'Ice Body',
    rating: 1.5,
    num: 115
  },
  {
    shortDesc: 'No competitive use.',
    id: 'illuminate',
    name: 'Illuminate',
    rating: 0,
    num: 35
  },
  {
    desc: 'When this Pokemon switches in, it appears as the last unfainted Pokemon in its party until it takes direct damage from another Pokemon\'s attack. This Pokemon\'s actual level and HP are displayed instead of those of the mimicked Pokemon.',
    shortDesc: 'This Pokemon appears as the last Pokemon in the party until it takes direct damage.',
    isUnbreakable: true,
    id: 'illusion',
    name: 'Illusion',
    rating: 4,
    num: 149
  },
  {
    shortDesc: 'This Pokemon cannot be poisoned. Gaining this Ability while poisoned cures it.',
    id: 'immunity',
    name: 'Immunity',
    rating: 2,
    num: 17
  },
  {
    desc: 'On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it. If there is no Pokemon at that position, this Pokemon does not Transform.',
    shortDesc: 'On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it.',
    id: 'imposter',
    name: 'Imposter',
    rating: 4.5,
    num: 150
  },
  {
    desc: 'This Pokemon\'s moves ignore substitutes and the opposing side\'s Reflect, Light Screen, Safeguard, Mist and Aurora Veil.',
    shortDesc: 'Moves ignore substitutes and foe\'s Reflect/Light Screen/Safeguard/Mist/Aurora Veil.',
    onModifyMove (move) {
      move.infiltrates = true;
    },
    id: 'infiltrator',
    name: 'Infiltrator',
    rating: 3,
    num: 151
  },
  {
    desc: 'If this Pokemon is knocked out with a move, that move\'s user loses HP equal to the amount of damage inflicted on this Pokemon.',
    shortDesc: 'If this Pokemon is KOed with a move, that move\'s user loses an equal amount of HP.',
    id: 'innardsout',
    name: 'Innards Out',
    onAfterDamageOrder: 1,
    onAfterDamage (damage, target, source, move) {
      if (source && source !== target && move && move.effectType === 'Move' && !target.hp) {
        this.damage(damage, source, target);
      }
    },
    rating: 2.5,
    num: 215
  },
  {
    shortDesc: 'This Pokemon cannot be made to flinch.',
    onFlinch: false,
    id: 'innerfocus',
    name: 'Inner Focus',
    rating: 1.5,
    num: 39
  },
  {
    shortDesc: 'This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.',
    onUpdate (pokemon) {
      if (pokemon.status === 'slp') {
        this.add('-activate', pokemon, 'ability: Insomnia');
        pokemon.cureStatus();
      }
    },
    onSetStatus (status, target, effect) {
      if (status.id !== 'slp') {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Insomnia');

      return false;
    },
    id: 'insomnia',
    name: 'Insomnia',
    rating: 2,
    num: 15
  },
  {
    desc: 'On switch-in, this Pokemon lowers the Attack of adjacent opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.',
    shortDesc: 'On switch-in, this Pokemon lowers the Attack of adjacent opponents by 1 stage.',
    onStart (pokemon) {
      let activated = false;

      for (const target of pokemon.side.foe.active) {
        if (!target || !this.isAdjacent(target, pokemon)) {
          continue;
        }
        if (!activated) {
          this.add('-ability', pokemon, 'Intimidate', 'boost');
          activated = true;
        }
        if (target.volatiles.substitute) {
          this.add('-immune', target, '[msg]');
        } else {
          this.boost({atk: -1}, target, pokemon);
        }
      }
    },
    id: 'intimidate',
    name: 'Intimidate',
    rating: 3.5,
    num: 22
  },
  {
    desc: 'Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.',
    shortDesc: 'Pokemon making contact with this Pokemon lose 1/8 of their max HP.',
    onAfterDamageOrder: 1,
    onAfterDamage (target, source, move) {
      if (source && source !== target && move && move.flags.contact) {
        this.damage(source.maxhp / 8, source, target);
      }
    },
    id: 'ironbarbs',
    name: 'Iron Barbs',
    rating: 3,
    num: 160
  },
  {
    desc: 'This Pokemon\'s punch-based attacks have their power multiplied by 1.2.',
    shortDesc: 'This Pokemon\'s punch-based attacks have 1.2x power. Sucker Punch is not boosted.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.flags.punch) {
        this.debug('Iron Fist boost');

        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'ironfist',
    name: 'Iron Fist',
    rating: 3,
    num: 89
  },
  {
    shortDesc: 'This Pokemon\'s Attack is raised by 1 stage after it is damaged by a Dark-type move.',
    onAfterDamage (effect) {
      if (effect && effect.type === 'Dark') {
        this.boost({atk: 1});
      }
    },
    id: 'justified',
    name: 'Justified',
    rating: 2,
    num: 154
  },
  {
    desc: 'Prevents other Pokemon from lowering this Pokemon\'s accuracy stat stage. This Pokemon ignores a target\'s evasiveness stat stage.',
    shortDesc: 'This Pokemon\'s accuracy can\'t be lowered by others; ignores their evasiveness stat.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      if (boost.accuracy && boost.accuracy < 0) {
        delete boost.accuracy;
        if (!effect.secondaries) {
          this.add('-fail', target, 'unboost', 'accuracy', '[from] ability: Keen Eye', `[of] ${target}`);
        }
      }
    },
    onModifyMove (move) {
      move.ignoreEvasion = true;
    },
    id: 'keeneye',
    name: 'Keen Eye',
    rating: 1,
    num: 51
  },
  {
    desc: 'This Pokemon\'s held item has no effect. This Pokemon cannot use Fling successfully. Macho Brace, Power Anklet, Power Band, Power Belt, Power Bracer, Power Lens, and Power Weight still have their effects.',
    shortDesc: 'This Pokemon\'s held item has no effect, except Macho Brace. Fling cannot be used.',

    id: 'klutz',
    name: 'Klutz',
    rating: -1,
    num: 103
  },
  {
    desc: 'If Sunny Day is active, this Pokemon cannot gain a major status condition and Rest will fail for it.',
    shortDesc: 'If Sunny Day is active, this Pokemon cannot be statused and Rest will fail for it.',
    onSetStatus (target, effect) {
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        if (effect && effect.status) {
          this.add('-immune', target, '[msg]', '[from] ability: Leaf Guard');
        }

        return false;
      }
    },
    onTryAddVolatile (status, target) {
      if (status.id === 'yawn' && this.isWeather(['sunnyday', 'desolateland'])) {
        this.add('-immune', target, '[msg]', '[from] ability: Leaf Guard');

        return null;
      }
    },
    id: 'leafguard',
    name: 'Leaf Guard',
    rating: 1,
    num: 102
  },
  {
    desc: 'This Pokemon is immune to Ground. Gravity, Ingrain, Smack Down, Thousand Arrows, and Iron Ball nullify the immunity.',
    shortDesc: 'This Pokemon is immune to Ground; Gravity/Ingrain/Smack Down/Iron Ball nullify it.',

    id: 'levitate',
    name: 'Levitate',
    rating: 3.5,
    num: 26
  },
  {
    shortDesc: 'This Pokemon\'s weight is halved.',
    onModifyWeight (weight) {
      return weight / 2;
    },
    id: 'lightmetal',
    name: 'Light Metal',
    rating: 1,
    num: 135
  },
  {
    desc: 'This Pokemon is immune to Electric-type moves and raises its Special Attack by 1 stage when hit by an Electric-type move. If this Pokemon is not the target of a single-target Electric-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move.',
    shortDesc: 'This Pokemon draws Electric moves to itself to raise Sp. Atk by 1; Electric immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Electric') {
        if (!this.boost({spa: 1})) {
          this.add('-immune', target, '[msg]', '[from] ability: Lightning Rod');
        }

        return null;
      }
    },
    onAnyRedirectTarget (target, source, move) {
      if (move.type !== 'Electric' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
        return;
      }
      if (this.validTarget(this.effectData.target, source, move.target)) {
        if (this.effectData.target !== target) {
          this.add('-activate', this.effectData.target, 'ability: Lightning Rod');
        }

        return this.effectData.target;
      }
    },
    id: 'lightningrod',
    name: 'Lightning Rod',
    rating: 3.5,
    num: 32
  },
  {
    shortDesc: 'This Pokemon cannot be paralyzed. Gaining this Ability while paralyzed cures it.',
    onUpdate (pokemon) {
      if (pokemon.status === 'par') {
        this.add('-activate', pokemon, 'ability: Limber');
        pokemon.cureStatus();
      }
    },
    onSetStatus (status, target, effect) {
      if (status.id !== 'par') {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Limber');

      return false;
    },
    id: 'limber',
    name: 'Limber',
    rating: 1.5,
    num: 7
  },
  {
    shortDesc: 'This Pokemon damages those draining HP from it for as much as they would heal.',
    id: 'liquidooze',
    onSourceTryHeal (damage, target, source, effect) {
      this.debug(`Heal is occurring: ${target} <- ${source} :: ${effect.id}`);
      const canOoze = {
        drain: 1,
        leechseed: 1,
        strengthsap: 1
      };

      if (canOoze[effect.id]) {
        this.damage(damage);

        return 0;
      }
    },
    name: 'Liquid Ooze',
    rating: 1.5,
    num: 64
  },
  {
    desc: 'This Pokemon\'s sound-based moves become Water-type moves. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
    shortDesc: 'This Pokemon\'s sound-based moves become Water type.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.flags.sound) {
        move.type = 'Water';
      }
    },
    id: 'liquidvoice',
    name: 'Liquid Voice',
    rating: 2.5,
    num: 204
  },
  {
    shortDesc: 'This Pokemon\'s attacks do not make contact with the target.',
    onModifyMove (move) {
      delete move.flags.contact;
    },
    id: 'longreach',
    name: 'Long Reach',
    rating: 1.5,
    num: 203
  },
  {
    desc: 'This Pokemon blocks certain status moves and instead uses the move against the original user.',
    shortDesc: 'This Pokemon blocks certain status moves and bounces them back to the user.',
    id: 'magicbounce',
    name: 'Magic Bounce',
    onTryHitPriority: 1,
    onTryHit (target, source, move) {
      if (target === source || move.hasBounced || !move.flags.reflectable) {
        return;
      }
      const newMove = this.getMoveCopy(move.id);

      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.useMove(newMove, target, source);

      return null;
    },
    onAllyTryHitSide (target, source, move) {
      if (target.side === source.side || move.hasBounced || !move.flags.reflectable) {
        return;
      }
      const newMove = this.getMoveCopy(move.id);

      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.useMove(newMove, this.effectData.target, source);

      return null;
    },
    effect: {duration: 1},
    rating: 4.5,
    num: 156
  },
  {
    desc: 'This Pokemon can only be damaged by direct attacks. Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage are considered direct damage.',
    shortDesc: 'This Pokemon can only be damaged by direct attacks.',
    onDamage (effect) {
      if (effect.effectType !== 'Move') {
        return false;
      }
    },
    id: 'magicguard',
    name: 'Magic Guard',
    rating: 4.5,
    num: 98
  },
  {
    desc: 'If this Pokemon has no item, it steals the item off a Pokemon it hits with an attack. Does not affect Doom Desire and Future Sight.',
    shortDesc: 'If this Pokemon has no item, it steals the item off a Pokemon it hits with an attack.',
    onSourceHit (target, source, move) {
      if (!move || !target) {
        return;
      }
      if (target !== source && move.category !== 'Status') {
        if (source.item || source.volatiles.gem || source.volatiles.fling) {
          return;
        }
        const yourItem = target.takeItem(source);

        if (!yourItem) {
          return;
        }
        if (!source.setItem(yourItem)) {
          target.item = yourItem.id;

          return;
        }
        this.add('-item', source, yourItem, '[from] ability: Magician', `[of] ${target}`);
      }
    },
    id: 'magician',
    name: 'Magician',
    rating: 1.5,
    num: 170
  },
  {
    shortDesc: 'This Pokemon cannot be frozen. Gaining this Ability while frozen cures it.',
    onUpdate (pokemon) {
      if (pokemon.status === 'frz') {
        this.add('-activate', pokemon, 'ability: Magma Armor');
        pokemon.cureStatus();
      }
    },
    onImmunity (type) {
      if (type === 'frz') {
        return false;
      }
    },
    id: 'magmaarmor',
    name: 'Magma Armor',
    rating: 0.5,
    num: 40
  },
  {
    desc: 'Prevents adjacent opposing Steel-type Pokemon from choosing to switch out unless they are immune to trapping.',
    shortDesc: 'Prevents adjacent Steel-type foes from choosing to switch.',
    onFoeTrapPokemon (pokemon) {
      if (pokemon.hasType('Steel') && this.isAdjacent(pokemon, this.effectData.target)) {
        pokemon.tryTrap(true);
      }
    },
    onFoeMaybeTrapPokemon (pokemon, source) {
      if (!source) {
        source = this.effectData.target;
      }
      if ((!pokemon.knownType || pokemon.hasType('Steel')) && this.isAdjacent(pokemon, source)) {
        pokemon.maybeTrapped = true;
      }
    },
    id: 'magnetpull',
    name: 'Magnet Pull',
    rating: 4.5,
    num: 42
  },
  {
    desc: 'If this Pokemon has a major status condition, its Defense is multiplied by 1.5.',
    shortDesc: 'If this Pokemon is statused, its Defense is 1.5x.',
    onModifyDefPriority: 6,
    onModifyDef (pokemon) {
      if (pokemon.status) {
        return this.chainModify(1.5);
      }
    },
    id: 'marvelscale',
    name: 'Marvel Scale',
    rating: 2.5,
    num: 63
  },
  {
    desc: 'This Pokemon\'s pulse moves have their power multiplied by 1.5. Heal Pulse restores 3/4 of a target\'s maximum HP, rounded half down.',
    shortDesc: 'This Pokemon\'s pulse moves have 1.5x power. Heal Pulse heals 3/4 target\'s max HP.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.flags.pulse) {
        return this.chainModify(1.5);
      }
    },
    id: 'megalauncher',
    name: 'Mega Launcher',
    rating: 3.5,
    num: 178
  },
  {
    shortDesc: 'This Pokemon\'s attacks are critical hits if the target is poisoned.',
    onModifyCritRatio (target) {
      if (target && ['psn', 'tox'].includes(target.status)) {
        return 5;
      }
    },
    id: 'merciless',
    name: 'Merciless',
    rating: 2,
    num: 196
  },
  {
    desc: 'If an active ally has this Ability or the Ability Plus, this Pokemon\'s Special Attack is multiplied by 1.5.',
    shortDesc: 'If an active ally has this Ability or the Ability Plus, this Pokemon\'s Sp. Atk is 1.5x.',
    onModifySpAPriority: 5,
    onModifySpA (pokemon) {
      if (pokemon.side.active.length === 1) {
        return;
      }
      for (const allyActive of pokemon.side.active) {
        if (allyActive && allyActive.position !== pokemon.position && !allyActive.fainted && allyActive.hasAbility(['minus', 'plus'])) {
          return this.chainModify(1.5);
        }
      }
    },
    id: 'minus',
    name: 'Minus',
    rating: 0,
    num: 58
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Misty Terrain.',
    onStart () {
      this.setTerrain('mistyterrain');
    },
    id: 'mistysurge',
    name: 'Misty Surge',
    rating: 4,
    num: 228
  },
  {
    shortDesc: 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Mold Breaker');
    },
    onModifyMove (move) {
      move.ignoreAbility = true;
    },
    id: 'moldbreaker',
    name: 'Mold Breaker',
    rating: 3.5,
    num: 104
  },
  {
    desc: 'This Pokemon has a random stat raised by 2 stages and another stat lowered by 1 stage at the end of each turn.',
    shortDesc: 'Raises a random stat by 2 and lowers another stat by 1 at the end of each turn.',
    onResidualOrder: 26,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      let stats = [];
      const boost = {};

      for (const statPlus in pokemon.boosts) {
        if (pokemon.boosts[statPlus] < 6) {
          stats.push(statPlus);
        }
      }
      let randomStat = stats.length ? this.sample(stats) : '';

      if (randomStat) {
        boost[randomStat] = 2;
      }
      stats = [];
      for (const statMinus in pokemon.boosts) {
        if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
          stats.push(statMinus);
        }
      }
      randomStat = stats.length ? this.sample(stats) : '';
      if (randomStat) {
        boost[randomStat] = -1;
      }
      this.boost(boost);
    },
    id: 'moody',
    name: 'Moody',
    rating: 5,
    num: 141
  },
  {
    desc: 'This Pokemon is immune to Electric-type moves and raises its Speed by 1 stage when hit by an Electric-type move.',
    shortDesc: 'This Pokemon\'s Speed is raised 1 stage if hit by an Electric move; Electric immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Electric') {
        if (!this.boost({spe: 1})) {
          this.add('-immune', target, '[msg]', '[from] ability: Motor Drive');
        }

        return null;
      }
    },
    id: 'motordrive',
    name: 'Motor Drive',
    rating: 3,
    num: 78
  },
  {
    desc: 'This Pokemon\'s Attack is raised by 1 stage if it attacks and knocks out another Pokemon.',
    shortDesc: 'This Pokemon\'s Attack is raised by 1 stage if it attacks and KOes another Pokemon.',
    onSourceFaint (source, effect) {
      if (effect && effect.effectType === 'Move') {
        this.boost({atk: 1}, source);
      }
    },
    id: 'moxie',
    name: 'Moxie',
    rating: 3.5,
    num: 153
  },
  {
    shortDesc: 'If this Pokemon is at full HP, damage taken from attacks is halved.',
    onSourceModifyDamage (target) {
      if (target.hp >= target.maxhp) {
        this.debug('Multiscale weaken');

        return this.chainModify(0.5);
      }
    },
    id: 'multiscale',
    name: 'Multiscale',
    rating: 4,
    num: 136
  },
  {
    shortDesc: 'If this Pokemon is an Arceus, its type changes to match its held Plate or Z-Crystal.',

    id: 'multitype',
    name: 'Multitype',
    rating: 4,
    num: 121
  },
  {
    desc: 'Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect the Abilities Battle Bond, Comatose, Disguise, Multitype, Power Construct, RKS System, Schooling, Shields Down, and Stance Change.',
    shortDesc: 'Pokemon making contact with this Pokemon have their Ability changed to Mummy.',
    id: 'mummy',
    name: 'Mummy',
    onAfterDamage (target, source, move) {
      if (source && source !== target && move && move.flags.contact && source.ability !== 'mummy') {
        const oldAbility = source.setAbility('mummy', target);

        if (oldAbility) {
          this.add('-activate', target, 'ability: Mummy', this.getAbility(oldAbility).name, `[of] ${source}`);
        }
      }
    },
    rating: 2,
    num: 152
  },
  {
    shortDesc: 'This Pokemon has its major status condition cured when it switches out.',
    id: 'naturalcure',
    name: 'Natural Cure',
    rating: 3.5,
    num: 30
  },
  {
    shortDesc: 'This Pokemon\'s attacks that are super effective against the target do 1.25x damage.',
    id: 'neuroforce',
    name: 'Neuroforce',
    rating: 3,
    num: 233
  },
  {
    shortDesc: 'Every move used by or against this Pokemon will always hit.',
    id: 'noguard',
    name: 'No Guard',
    rating: 4,
    num: 99
  },
  {
    desc: 'This Pokemon\'s moves are changed to be Normal type and have their power multiplied by 1.2. This effect comes before other effects that change a move\'s type.',
    shortDesc: 'This Pokemon\'s moves are changed to be Normal type and have 1.2x power.',
    onModifyMovePriority: 1,
    onModifyMove (move) {
      if (!(move.isZ && move.category !== 'Status') && !['hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'weatherball'].includes(move.id)) {
        move.type = 'Normal';
        move.normalizeBoosted = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.normalizeBoosted) {
        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'normalize',
    name: 'Normalize',
    rating: -1,
    num: 96
  },
  {
    desc: 'This Pokemon cannot be infatuated or taunted. Gaining this Ability while affected cures it.',
    shortDesc: 'This Pokemon cannot be infatuated or taunted. Gaining this Ability cures it.',
    onUpdate (pokemon) {
      if (pokemon.volatiles.attract) {
        this.add('-activate', pokemon, 'ability: Oblivious');
        pokemon.removeVolatile('attract');
        this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
      }
      if (pokemon.volatiles.taunt) {
        this.add('-activate', pokemon, 'ability: Oblivious');
        pokemon.removeVolatile('taunt');

      }
    },
    onImmunity (type) {
      if (type === 'attract') {
        return false;
      }
    },
    onTryHit (pokemon, move) {
      if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
        this.add('-immune', pokemon, '[msg]', '[from] ability: Oblivious');

        return null;
      }
    },
    id: 'oblivious',
    name: 'Oblivious',
    rating: 1,
    num: 12
  },
  {
    shortDesc: 'This Pokemon is immune to powder moves and damage from Sandstorm or Hail.',
    onImmunity (type) {
      if (type === 'sandstorm' || type === 'hail' || type === 'powder') {
        return false;
      }
    },
    onTryHitPriority: 1,
    onTryHit (target, source, move) {
      if (move.flags.powder && target !== source && this.getImmunity('powder', target)) {
        this.add('-immune', target, '[msg]', '[from] ability: Overcoat');

        return null;
      }
    },
    id: 'overcoat',
    name: 'Overcoat',
    rating: 2.5,
    num: 142
  },
  {
    desc: 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Grass-type attack.',
    shortDesc: 'At 1/3 or less of its max HP, this Pokemon\'s attacking stat is 1.5x with Grass attacks.',
    onModifyAtkPriority: 5,
    onModifyAtk (attacker, move) {
      if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Overgrow boost');

        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (attacker, move) {
      if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Overgrow boost');

        return this.chainModify(1.5);
      }
    },
    id: 'overgrow',
    name: 'Overgrow',
    rating: 2,
    num: 65
  },
  {
    shortDesc: 'This Pokemon cannot be confused. Gaining this Ability while confused cures it.',
    onUpdate (pokemon) {
      if (pokemon.volatiles.confusion) {
        this.add('-activate', pokemon, 'ability: Own Tempo');
        pokemon.removeVolatile('confusion');
      }
    },
    onTryAddVolatile (status) {
      if (status.id === 'confusion') {
        return null;
      }
    },
    onHit (target, move) {
      if (move && move.volatileStatus === 'confusion') {
        this.add('-immune', target, 'confusion', '[from] ability: Own Tempo');
      }
    },
    id: 'owntempo',
    name: 'Own Tempo',
    rating: 1.5,
    num: 20
  },
  {
    desc: 'This Pokemon\'s damaging moves become multi-hit moves that hit twice. The second hit has its damage quartered. Does not affect multi-hit moves or moves that have multiple targets.',
    shortDesc: 'This Pokemon\'s damaging moves hit twice. The second hit has its damage quartered.',
    onPrepareHit (move) {
      if (['iceball', 'rollout'].includes(move.id)) {
        return;
      }
      if (move.category !== 'Status' && !move.selfdestruct && !move.multihit && !move.flags.charge && !move.spreadHit && !move.isZ) {
        move.multihit = 2;
        move.hasParentalBond = true;
        move.hit = 0;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.hasParentalBond && ++move.hit > 1) {
        return this.chainModify(0.25);
      }
    },
    onSourceModifySecondaries (secondaries, move) {
      if (move.hasParentalBond && move.id === 'secretpower' && move.hit < 2) {

        return secondaries.filter(effect => effect.volatileStatus === 'flinch');
      }
    },
    id: 'parentalbond',
    name: 'Parental Bond',
    rating: 5,
    num: 184
  },
  {
    shortDesc: 'If this Pokemon has no item, it finds one used by an adjacent Pokemon this turn.',
    onResidualOrder: 26,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (pokemon.item) {
        return;
      }
      const pickupTargets = [];

      for (const target of pokemon.side.active.concat(pokemon.side.foe.active)) {
        if (target.lastItem && target.usedItemThisTurn && this.isAdjacent(pokemon, target)) {
          pickupTargets.push(target);
        }
      }
      if (!pickupTargets.length) {
        return;
      }
      const randomTarget = this.sample(pickupTargets);

      pokemon.setItem(randomTarget.lastItem);
      randomTarget.lastItem = '';
      const item = pokemon.getItem();

      this.add('-item', pokemon, item, '[from] ability: Pickup');
    },
    id: 'pickup',
    name: 'Pickup',
    rating: 0.5,
    num: 53
  },
  {
    desc: 'If this Pokemon has no item, it steals the item off a Pokemon that makes contact with it. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect.',
    shortDesc: 'If this Pokemon has no item, it steals the item off a Pokemon making contact with it.',
    onAfterMoveSecondary (target, source, move) {
      if (source && source !== target && move && move.flags.contact) {
        if (target.item) {
          return;
        }
        const yourItem = source.takeItem(target);

        if (!yourItem) {
          return;
        }
        if (!target.setItem(yourItem)) {
          source.item = yourItem.id;

          return;
        }
        this.add('-item', target, yourItem, '[from] ability: Pickpocket', `[of] ${source}`);
      }
    },
    id: 'pickpocket',
    name: 'Pickpocket',
    rating: 1,
    num: 124
  },
  {
    desc: 'This Pokemon\'s Normal-type moves become Fairy-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
    shortDesc: 'This Pokemon\'s Normal-type moves become Fairy type and have 1.2x power.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.type === 'Normal' && !['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'weatherball'].includes(move.id) && !(move.isZ && move.category !== 'Status')) {
        move.type = 'Fairy';
        move.pixilateBoosted = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.pixilateBoosted) {
        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'pixilate',
    name: 'Pixilate',
    rating: 4,
    num: 182
  },
  {
    desc: 'If an active ally has this Ability or the Ability Minus, this Pokemon\'s Special Attack is multiplied by 1.5.',
    shortDesc: 'If an active ally has this Ability or the Ability Minus, this Pokemon\'s Sp. Atk is 1.5x.',
    onModifySpAPriority: 5,
    onModifySpA (pokemon) {
      if (pokemon.side.active.length === 1) {
        return;
      }
      for (const allyActive of pokemon.side.active) {
        if (allyActive && allyActive.position !== pokemon.position && !allyActive.fainted && allyActive.hasAbility(['minus', 'plus'])) {
          return this.chainModify(1.5);
        }
      }
    },
    id: 'plus',
    name: 'Plus',
    rating: 0,
    num: 57
  },
  {
    desc: 'If this Pokemon is poisoned, it restores 1/8 of its maximum HP, rounded down, at the end of each turn instead of losing HP.',
    shortDesc: 'This Pokemon is healed by 1/8 of its max HP each turn when poisoned; no HP loss.',
    onDamagePriority: 1,
    onDamage (target, effect) {
      if (effect.id === 'psn' || effect.id === 'tox') {
        this.heal(target.maxhp / 8);

        return false;
      }
    },
    id: 'poisonheal',
    name: 'Poison Heal',
    rating: 4,
    num: 90
  },
  {
    shortDesc: '30% chance a Pokemon making contact with this Pokemon will be poisoned.',
    onAfterDamage (target, source, move) {
      if (move && move.flags.contact) {
        if (this.randomChance(3, 10)) {
          source.trySetStatus('psn', target);
        }
      }
    },
    id: 'poisonpoint',
    name: 'Poison Point',
    rating: 2,
    num: 38
  },
  {
    shortDesc: 'This Pokemon\'s contact moves have a 30% chance of poisoning.',

    onModifyMove (move) {
      if (!move || !move.flags.contact) {
        return;
      }
      if (!move.secondaries) {
        move.secondaries = [];
      }
      move.secondaries.push({
        chance: 30,
        status: 'psn',
        ability: this.getAbility('poisontouch')
      });
    },
    id: 'poisontouch',
    name: 'Poison Touch',
    rating: 2,
    num: 143
  },
  {
    desc: 'If this Pokemon is a Zygarde in its 10% or 50% Forme, it changes to Complete Forme when it has 1/2 or less of its maximum HP at the end of the turn.',
    shortDesc: 'If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn.',
    onResidualOrder: 27,
    onResidual (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Zygarde' || pokemon.transformed || !pokemon.hp) {
        return;
      }
      if (pokemon.template.speciesid === 'zygardecomplete' || pokemon.hp > pokemon.maxhp / 2) {
        return;
      }
      this.add('-activate', pokemon, 'ability: Power Construct');
      pokemon.formeChange('Zygarde-Complete', this.effect, true);
      const newHP = Math.floor(Math.floor(2 * pokemon.template.baseStats.hp + pokemon.set.ivs.hp + Math.floor(pokemon.set.evs.hp / 4) + 100) * pokemon.level / 100 + 10);

      pokemon.hp = newHP - (pokemon.maxhp - pokemon.hp);
      pokemon.maxhp = newHP;
      this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
    },
    id: 'powerconstruct',
    name: 'Power Construct',
    rating: 4,
    num: 211
  },
  {
    desc: 'This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, Wonder Guard, and Zen Mode.',
    shortDesc: 'This Pokemon copies the Ability of an ally that faints.',
    onAllyFaint (target) {
      if (!this.effectData.target.hp) {
        return;
      }
      const ability = this.getAbility(target.ability);
      const bannedAbilities = ['battlebond', 'comatose', 'disguise', 'flowergift', 'forecast', 'illusion', 'imposter', 'multitype', 'powerconstruct', 'powerofalchemy', 'receiver', 'rkssystem', 'schooling', 'shieldsdown', 'stancechange', 'trace', 'wonderguard', 'zenmode'];

      if (bannedAbilities.includes(target.ability)) {
        return;
      }
      this.add('-ability', this.effectData.target, ability, '[from] ability: Power of Alchemy', `[of] ${target}`);
      this.effectData.target.setAbility(ability);
    },
    id: 'powerofalchemy',
    name: 'Power of Alchemy',
    rating: 0,
    num: 223
  },
  {
    shortDesc: 'This Pokemon\'s Status moves have priority raised by 1, but Dark types are immune.',
    onModifyPriority (priority, move) {
      if (move && move.category === 'Status') {
        move.pranksterBoosted = true;

        return priority + 1;
      }
    },
    id: 'prankster',
    name: 'Prankster',
    rating: 4,
    num: 158
  },
  {
    desc: 'If this Pokemon is the target of an opposing Pokemon\'s move, that move loses one additional PP.',
    shortDesc: 'If this Pokemon is the target of a foe\'s move, that move loses one additional PP.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Pressure');
    },
    onDeductPP (target, source) {
      if (target.side === source.side) {
        return;
      }

      return 1;
    },
    id: 'pressure',
    name: 'Pressure',
    rating: 2,
    num: 46
  },
  {
    desc: 'On switch-in, the weather becomes heavy rain that prevents damaging Fire-type moves from executing, in addition to all the effects of Rain Dance. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Delta Stream or Desolate Land.',
    shortDesc: 'On switch-in, heavy rain begins until this Ability is not active in battle.',
    onStart () {
      this.setWeather('primordialsea');
    },
    onAnySetWeather (weather) {
      if (this.getWeather().id === 'primordialsea' && !['desolateland', 'primordialsea', 'deltastream'].includes(weather.id)) {
        return false;
      }
    },
    onEnd (pokemon) {
      if (this.weatherData.source !== pokemon) {
        return;
      }
      for (const side of this.sides) {
        for (const target of side.active) {
          if (target === pokemon) {
            continue;
          }
          if (target && target.hp && target.hasAbility('primordialsea')) {
            this.weatherData.source = target;

            return;
          }
        }
      }
      this.clearWeather();
    },
    id: 'primordialsea',
    name: 'Primordial Sea',
    rating: 5,
    num: 189
  },
  {
    desc: 'This Pokemon receives 3/4 damage from supereffective attacks. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability.',
    shortDesc: 'This Pokemon receives 3/4 damage from supereffective attacks.',
    onSourceModifyDamage (move) {
      if (move.typeMod > 0) {
        this.debug('Prism Armor neutralize');

        return this.chainModify(0.75);
      }
    },
    isUnbreakable: true,
    id: 'prismarmor',
    name: 'Prism Armor',
    rating: 3,
    num: 232
  },
  {
    desc: 'This Pokemon\'s type changes to match the type of the move it is about to use. This effect comes after all effects that change a move\'s type.',
    shortDesc: 'This Pokemon\'s type changes to match the type of the move it is about to use.',
    id: 'protean',
    name: 'Protean',
    rating: 4,
    num: 168
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Psychic Terrain.',
    onStart () {
      this.setTerrain('psychicterrain');
    },
    id: 'psychicsurge',
    name: 'Psychic Surge',
    rating: 4,
    num: 227
  },
  {
    shortDesc: 'This Pokemon\'s Attack is doubled.',
    onModifyAtkPriority: 5,
    onModifyAtk () {
      return this.chainModify(2);
    },
    id: 'purepower',
    name: 'Pure Power',
    rating: 5,
    num: 74
  },
  {
    desc: 'While this Pokemon is active, priority moves from opposing Pokemon targeted at allies are prevented from having an effect.',
    shortDesc: 'While this Pokemon is active, allies are protected from opposing priority moves.',
    onFoeTryMove (target, source, effect) {
      if ((source.side === this.effectData.target.side || effect.id === 'perishsong') && effect.priority > 0.1 && effect.target !== 'foeSide') {
        this.attrLastMove('[still]');
        this.add('cant', this.effectData.target, 'ability: Queenly Majesty', effect, `[of] ${target}`);

        return false;
      }
    },
    id: 'queenlymajesty',
    name: 'Queenly Majesty',
    rating: 3,
    num: 214
  },
  {
    desc: 'If this Pokemon has a major status condition, its Speed is multiplied by 1.5; the Speed drop from paralysis is ignored.',
    shortDesc: 'If this Pokemon is statused, its Speed is 1.5x; ignores Speed drop from paralysis.',
    onModifySpe (pokemon) {
      if (pokemon.status) {
        return this.chainModify(1.5);
      }
    },
    id: 'quickfeet',
    name: 'Quick Feet',
    rating: 2.5,
    num: 95
  },
  {
    desc: 'If Rain Dance is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn.',
    shortDesc: 'If Rain Dance is active, this Pokemon heals 1/16 of its max HP each turn.',
    onWeather (target, effect) {
      if (effect.id === 'raindance' || effect.id === 'primordialsea') {
        this.heal(target.maxhp / 16);
      }
    },
    id: 'raindish',
    name: 'Rain Dish',
    rating: 1.5,
    num: 44
  },
  {
    desc: 'This Pokemon\'s Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.',
    shortDesc: 'This Pokemon\'s Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.',
    onAfterDamage (effect) {
      if (effect && (effect.type === 'Dark' || effect.type === 'Bug' || effect.type === 'Ghost')) {
        this.boost({spe: 1});
      }
    },
    id: 'rattled',
    name: 'Rattled',
    rating: 1.5,
    num: 155
  },
  {
    desc: 'This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, Wonder Guard, and Zen Mode.',
    shortDesc: 'This Pokemon copies the Ability of an ally that faints.',
    onAllyFaint (target) {
      if (!this.effectData.target.hp) {
        return;
      }
      const ability = this.getAbility(target.ability);
      const bannedAbilities = ['battlebond', 'comatose', 'disguise', 'flowergift', 'forecast', 'illusion', 'imposter', 'multitype', 'powerconstruct', 'powerofalchemy', 'receiver', 'rkssystem', 'schooling', 'shieldsdown', 'stancechange', 'trace', 'wonderguard', 'zenmode'];

      if (bannedAbilities.includes(target.ability)) {
        return;
      }
      this.add('-ability', this.effectData.target, ability, '[from] ability: Receiver', `[of] ${target}`);
      this.effectData.target.setAbility(ability);
    },
    id: 'receiver',
    name: 'Receiver',
    rating: 0,
    num: 222
  },
  {
    desc: 'This Pokemon\'s attacks with recoil or crash damage have their power multiplied by 1.2. Does not affect Struggle.',
    shortDesc: 'This Pokemon\'s attacks with recoil or crash damage have 1.2x power; not Struggle.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.recoil || move.hasCustomRecoil) {
        this.debug('Reckless boost');

        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'reckless',
    name: 'Reckless',
    rating: 3,
    num: 120
  },
  {
    desc: 'This Pokemon\'s Normal-type moves become Ice-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
    shortDesc: 'This Pokemon\'s Normal-type moves become Ice type and have 1.2x power.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.type === 'Normal' && !['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'weatherball'].includes(move.id) && !(move.isZ && move.category !== 'Status')) {
        move.type = 'Ice';
        move.refrigerateBoosted = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.refrigerateBoosted) {
        return this.chainModify([0x1333, 0x1000]);
      }
    },
    id: 'refrigerate',
    name: 'Refrigerate',
    rating: 4,
    num: 174
  },
  {
    shortDesc: 'This Pokemon restores 1/3 of its maximum HP, rounded down, when it switches out.',
    onSwitchOut (pokemon) {
      pokemon.heal(pokemon.maxhp / 3);
    },
    id: 'regenerator',
    name: 'Regenerator',
    rating: 4,
    num: 144
  },
  {
    desc: 'This Pokemon\'s attacks have their power multiplied by 1.25 against targets of the same gender or multiplied by 0.75 against targets of the opposite gender. There is no modifier if either this Pokemon or the target is genderless.',
    shortDesc: 'This Pokemon\'s attacks do 1.25x on same gender targets; 0.75x on opposite gender.',
    onBasePowerPriority: 8,
    onBasePower (attacker, defender) {
      if (attacker.gender && defender.gender) {
        if (attacker.gender === defender.gender) {
          this.debug('Rivalry boost');

          return this.chainModify(1.25);
        }
        this.debug('Rivalry weaken');

        return this.chainModify(0.75);

      }
    },
    id: 'rivalry',
    name: 'Rivalry',
    rating: 0.5,
    num: 79
  },
  {
    shortDesc: 'If this Pokemon is a Silvally, its type changes to match its held Memory.',

    id: 'rkssystem',
    name: 'RKS System',
    rating: 4,
    num: 225
  },
  {
    desc: 'This Pokemon does not take recoil damage besides Struggle, Life Orb, and crash damage.',
    shortDesc: 'This Pokemon does not take recoil damage besides Struggle/Life Orb/crash damage.',
    onDamage (effect) {
      if (effect.id === 'recoil') {
        if (!this.activeMove) {
          throw new Error('Battle.activeMove is null');
        }
        if (this.activeMove.id !== 'struggle') {
          return null;
        }
      }
    },
    id: 'rockhead',
    name: 'Rock Head',
    rating: 2.5,
    num: 69
  },
  {
    desc: 'Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.',
    shortDesc: 'Pokemon making contact with this Pokemon lose 1/8 of their max HP.',
    onAfterDamageOrder: 1,
    onAfterDamage (target, source, move) {
      if (source && source !== target && move && move.flags.contact) {
        this.damage(source.maxhp / 8, source, target);
      }
    },
    id: 'roughskin',
    name: 'Rough Skin',
    rating: 3,
    num: 24
  },
  {
    shortDesc: 'No competitive use.',
    id: 'runaway',
    name: 'Run Away',
    rating: 0,
    num: 50
  },
  {
    desc: 'If Sandstorm is active, this Pokemon\'s Ground-, Rock-, and Steel-type attacks have their power multiplied by 1.3. This Pokemon takes no damage from Sandstorm.',
    shortDesc: 'This Pokemon\'s Ground/Rock/Steel attacks do 1.3x in Sandstorm; immunity to it.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (this.isWeather('sandstorm')) {
        if (move.type === 'Rock' || move.type === 'Ground' || move.type === 'Steel') {
          this.debug('Sand Force boost');

          return this.chainModify([0x14CD, 0x1000]);
        }
      }
    },
    onImmunity (type) {
      if (type === 'sandstorm') {
        return false;
      }
    },
    id: 'sandforce',
    name: 'Sand Force',
    rating: 2,
    num: 159
  },
  {
    desc: 'If Sandstorm is active, this Pokemon\'s Speed is doubled. This Pokemon takes no damage from Sandstorm.',
    shortDesc: 'If Sandstorm is active, this Pokemon\'s Speed is doubled; immunity to Sandstorm.',
    onModifySpe () {
      if (this.isWeather('sandstorm')) {
        return this.chainModify(2);
      }
    },
    onImmunity (type) {
      if (type === 'sandstorm') {
        return false;
      }
    },
    id: 'sandrush',
    name: 'Sand Rush',
    rating: 3,
    num: 146
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Sandstorm.',
    onStart () {
      this.setWeather('sandstorm');
    },
    id: 'sandstream',
    name: 'Sand Stream',
    rating: 4.5,
    num: 45
  },
  {
    desc: 'If Sandstorm is active, this Pokemon\'s evasiveness is multiplied by 1.25. This Pokemon takes no damage from Sandstorm.',
    shortDesc: 'If Sandstorm is active, this Pokemon\'s evasiveness is 1.25x; immunity to Sandstorm.',
    onImmunity (type) {
      if (type === 'sandstorm') {
        return false;
      }
    },
    onModifyAccuracy (accuracy) {
      if (typeof accuracy !== 'number') {
        return;
      }
      if (this.isWeather('sandstorm')) {
        this.debug('Sand Veil - decreasing accuracy');

        return accuracy * 0.8;
      }
    },
    id: 'sandveil',
    name: 'Sand Veil',
    rating: 1.5,
    num: 8
  },
  {
    desc: 'This Pokemon is immune to Grass-type moves and raises its Attack by 1 stage when hit by a Grass-type move.',
    shortDesc: 'This Pokemon\'s Attack is raised 1 stage if hit by a Grass move; Grass immunity.',
    onTryHitPriority: 1,
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Grass') {
        if (!this.boost({atk: 1})) {
          this.add('-immune', target, '[msg]', '[from] ability: Sap Sipper');
        }

        return null;
      }
    },
    onAllyTryHitSide (target, source, move) {
      if (target === this.effectData.target || target.side !== source.side) {
        return;
      }
      if (move.type === 'Grass') {
        this.boost({atk: 1}, this.effectData.target);
      }
    },
    id: 'sapsipper',
    name: 'Sap Sipper',
    rating: 3.5,
    num: 157
  },
  {
    desc: 'On switch-in, if this Pokemon is a Wishiwashi that is level 20 or above and has more than 1/4 of its maximum HP left, it changes to School Form. If it is in School Form and its HP drops to 1/4 of its maximum HP or less, it changes to Solo Form at the end of the turn. If it is in Solo Form and its HP is greater than 1/4 its maximum HP at the end of the turn, it changes to School Form.',
    shortDesc: 'If user is Wishiwashi, changes to School Form if it has > 1/4 max HP, else Solo Form.',
    onStart (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed) {
        return;
      }
      if (pokemon.hp > pokemon.maxhp / 4) {
        if (pokemon.template.speciesid === 'wishiwashi') {
          pokemon.formeChange('Wishiwashi-School');
        }
      } else if (pokemon.template.speciesid === 'wishiwashischool') {
        pokemon.formeChange('Wishiwashi');
      }
    },
    onResidualOrder: 27,
    onResidual (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed || !pokemon.hp) {
        return;
      }
      if (pokemon.hp > pokemon.maxhp / 4) {
        if (pokemon.template.speciesid === 'wishiwashi') {
          pokemon.formeChange('Wishiwashi-School');
        }
      } else if (pokemon.template.speciesid === 'wishiwashischool') {
        pokemon.formeChange('Wishiwashi');
      }
    },
    id: 'schooling',
    name: 'Schooling',
    rating: 3,
    num: 208
  },
  {
    shortDesc: 'This Pokemon can hit Ghost types with Normal- and Fighting-type moves.',
    onModifyMovePriority: -5,
    onModifyMove (move) {
      if (!move.ignoreImmunity) {
        move.ignoreImmunity = {};
      }
      if (move.ignoreImmunity !== true) {
        move.ignoreImmunity.Fighting = true;
        move.ignoreImmunity.Normal = true;
      }
    },
    id: 'scrappy',
    name: 'Scrappy',
    rating: 3,
    num: 113
  },
  {
    shortDesc: 'This Pokemon\'s moves have their secondary effect chance doubled.',
    onModifyMovePriority: -2,
    onModifyMove (move) {
      if (move.secondaries) {
        this.debug('doubling secondary chance');
        for (const secondary of move.secondaries) {
          secondary.chance *= 2;
        }
      }
    },
    id: 'serenegrace',
    name: 'Serene Grace',
    rating: 4,
    num: 32
  },
  {
    desc: 'If this Pokemon is at full HP, damage taken from attacks is halved. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability.',
    shortDesc: 'If this Pokemon is at full HP, damage taken from attacks is halved.',
    onSourceModifyDamage (target) {
      if (target.hp >= target.maxhp) {
        this.debug('Shadow Shield weaken');

        return this.chainModify(0.5);
      }
    },
    isUnbreakable: true,
    id: 'shadowshield',
    name: 'Shadow Shield',
    rating: 4,
    num: 231
  },
  {
    desc: 'Prevents adjacent opposing Pokemon from choosing to switch out unless they are immune to trapping or also have this Ability.',
    shortDesc: 'Prevents adjacent foes from choosing to switch unless they also have this Ability.',
    onFoeTrapPokemon (pokemon) {
      if (!pokemon.hasAbility('shadowtag') && this.isAdjacent(pokemon, this.effectData.target)) {
        pokemon.tryTrap(true);
      }
    },
    onFoeMaybeTrapPokemon (pokemon, source) {
      if (!source) {
        source = this.effectData.target;
      }
      if (!pokemon.hasAbility('shadowtag') && this.isAdjacent(pokemon, source)) {
        pokemon.maybeTrapped = true;
      }
    },
    id: 'shadowtag',
    name: 'Shadow Tag',
    rating: 5,
    num: 23
  },
  {
    desc: 'This Pokemon has a 33% chance to have its major status condition cured at the end of each turn.',
    shortDesc: 'This Pokemon has a 33% chance to have its status cured at the end of each turn.',
    onResidualOrder: 5,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (pokemon.hp && pokemon.status && this.randomChance(1, 3)) {
        this.debug('shed skin');
        this.add('-activate', pokemon, 'ability: Shed Skin');
        pokemon.cureStatus();
      }
    },
    id: 'shedskin',
    name: 'Shed Skin',
    rating: 3.5,
    num: 61
  },
  {
    desc: 'This Pokemon\'s attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed.',
    shortDesc: 'This Pokemon\'s attacks with secondary effects have 1.3x power; nullifies the effects.',
    onModifyMove (move) {
      if (move.secondaries) {
        delete move.secondaries;

        move.hasSheerForce = true;
      }
    },
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.hasSheerForce) {
        return this.chainModify([0x14CD, 0x1000]);
      }
    },
    id: 'sheerforce',
    name: 'Sheer Force',
    rating: 4,
    num: 125
  },
  {
    shortDesc: 'This Pokemon cannot be struck by a critical hit.',
    onCriticalHit: false,
    id: 'shellarmor',
    name: 'Shell Armor',
    rating: 1,
    num: 75
  },
  {
    shortDesc: 'This Pokemon is not affected by the secondary effect of another Pokemon\'s attack.',
    onModifySecondaries (secondaries) {
      this.debug('Shield Dust prevent secondary');

      return secondaries.filter(effect => Boolean(effect.self || effect.dustproof));
    },
    id: 'shielddust',
    name: 'Shield Dust',
    rating: 2.5,
    num: 19
  },
  {
    desc: 'If this Pokemon is a Minior, it changes to its Core forme if it has 1/2 or less of its maximum HP, and changes to Meteor Form if it has more than 1/2 its maximum HP. This check is done on switch-in and at the end of each turn. While in its Meteor Form, it cannot become affected by major status conditions. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability.',
    shortDesc: 'If Minior, switch-in/end of turn it changes to Core at 1/2 max HP or less, else Meteor.',
    onStart (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Minior' || pokemon.transformed) {
        return;
      }
      if (pokemon.hp > pokemon.maxhp / 2) {
        if (pokemon.template.speciesid === 'minior') {
          pokemon.formeChange('Minior-Meteor');
        }
      } else if (pokemon.template.speciesid !== 'minior') {
        pokemon.formeChange(pokemon.set.species);
      }
    },
    onResidualOrder: 27,
    onResidual (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Minior' || pokemon.transformed || !pokemon.hp) {
        return;
      }
      if (pokemon.hp > pokemon.maxhp / 2) {
        if (pokemon.template.speciesid === 'minior') {
          pokemon.formeChange('Minior-Meteor');
        }
      } else if (pokemon.template.speciesid !== 'minior') {
        pokemon.formeChange(pokemon.set.species);
      }
    },
    onSetStatus (target, effect) {
      if (target.template.speciesid !== 'miniormeteor' || target.transformed) {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Shields Down');

      return false;
    },
    onTryAddVolatile (status, target) {
      if (target.template.speciesid !== 'miniormeteor' || target.transformed) {
        return;
      }
      if (status.id !== 'yawn') {
        return;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Shields Down');

      return null;
    },
    isUnbreakable: true,
    id: 'shieldsdown',
    name: 'Shields Down',
    rating: 3,
    num: 197
  },
  {
    shortDesc: 'When this Pokemon\'s stat stages are raised or lowered, the effect is doubled instead.',
    onBoost (boost, effect) {
      if (effect && effect.id === 'zpower') {
        return;
      }
      for (const i in boost) {
        boost[i] *= 2;
      }
    },
    id: 'simple',
    name: 'Simple',
    rating: 4,
    num: 86
  },
  {
    shortDesc: 'This Pokemon\'s multi-hit attacks always hit the maximum number of times.',
    onModifyMove (move) {
      if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
        move.multihit = move.multihit[1];
      }
      if (move.multiaccuracy) {
        delete move.multiaccuracy;
      }
    },
    id: 'skilllink',
    name: 'Skill Link',
    rating: 4,
    num: 92
  },
  {
    shortDesc: 'On switch-in, this Pokemon\'s Attack and Speed are halved for 5 turns.',
    onStart (pokemon) {
      pokemon.addVolatile('slowstart');
    },
    onEnd (pokemon) {
      delete pokemon.volatiles.slowstart;
      this.add('-end', pokemon, 'Slow Start', '[silent]');
    },
    effect: {
      duration: 5,
      onStart (target) {
        this.add('-start', target, 'ability: Slow Start');
      },
      onModifyAtkPriority: 5,
      onModifyAtk () {
        return this.chainModify(0.5);
      },
      onModifySpe () {
        return this.chainModify(0.5);
      },
      onEnd (target) {
        this.add('-end', target, 'Slow Start');
      }
    },
    id: 'slowstart',
    name: 'Slow Start',
    rating: -2,
    num: 112
  },
  {
    shortDesc: 'If Hail is active, this Pokemon\'s Speed is doubled.',
    onModifySpe () {
      if (this.isWeather('hail')) {
        return this.chainModify(2);
      }
    },
    id: 'slushrush',
    name: 'Slush Rush',
    rating: 2.5,
    num: 202
  },
  {
    shortDesc: 'If this Pokemon strikes with a critical hit, the damage is multiplied by 1.5.',
    onModifyDamage (move) {
      if (move.crit) {
        this.debug('Sniper boost');

        return this.chainModify(1.5);
      }
    },
    id: 'sniper',
    name: 'Sniper',
    rating: 1,
    num: 97
  },
  {
    desc: 'If Hail is active, this Pokemon\'s evasiveness is multiplied by 1.25. This Pokemon takes no damage from Hail.',
    shortDesc: 'If Hail is active, this Pokemon\'s evasiveness is 1.25x; immunity to Hail.',
    onImmunity (type) {
      if (type === 'hail') {
        return false;
      }
    },
    onModifyAccuracy (accuracy) {
      if (typeof accuracy !== 'number') {
        return;
      }
      if (this.isWeather('hail')) {
        this.debug('Snow Cloak - decreasing accuracy');

        return accuracy * 0.8;
      }
    },
    id: 'snowcloak',
    name: 'Snow Cloak',
    rating: 1.5,
    num: 81
  },
  {
    shortDesc: 'On switch-in, this Pokemon summons Hail.',
    onStart () {
      this.setWeather('hail');
    },
    id: 'snowwarning',
    name: 'Snow Warning',
    rating: 4,
    num: 117
  },
  {
    desc: 'If Sunny Day is active, this Pokemon\'s Special Attack is multiplied by 1.5 and it loses 1/8 of its maximum HP, rounded down, at the end of each turn.',
    shortDesc: 'If Sunny Day is active, this Pokemon\'s Sp. Atk is 1.5x; loses 1/8 max HP per turn.',
    onModifySpAPriority: 5,
    onModifySpA () {
      if (this.isWeather(['sunnyday', 'desolateland'])) {
        return this.chainModify(1.5);
      }
    },
    onWeather (target, effect) {
      if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
        this.damage(target.maxhp / 8, target, target);
      }
    },
    id: 'solarpower',
    name: 'Solar Power',
    rating: 1.5,
    num: 94
  },
  {
    shortDesc: 'This Pokemon receives 3/4 damage from supereffective attacks.',
    onSourceModifyDamage (move) {
      if (move.typeMod > 0) {
        this.debug('Solid Rock neutralize');

        return this.chainModify(0.75);
      }
    },
    id: 'solidrock',
    name: 'Solid Rock',
    rating: 3,
    num: 116
  },
  {
    desc: 'This Pokemon\'s Special Attack is raised by 1 stage when another Pokemon faints.',
    shortDesc: 'This Pokemon\'s Sp. Atk is raised by 1 stage when another Pokemon faints.',
    onAnyFaint () {
      this.boost({spa: 1}, this.effectData.target);
    },
    id: 'soulheart',
    name: 'Soul-Heart',
    rating: 3.5,
    num: 220
  },
  {
    shortDesc: 'This Pokemon is immune to sound-based moves, including Heal Bell.',
    onTryHit (target, move) {
      if (move.flags.sound) {
        this.add('-immune', target, '[msg]', '[from] ability: Soundproof');

        return null;
      }
    },
    onAllyTryHitSide (move) {
      if (move.flags.sound) {
        this.add('-immune', this.effectData.target, '[msg]', '[from] ability: Soundproof');
      }
    },
    id: 'soundproof',
    name: 'Soundproof',
    rating: 2,
    num: 43
  },
  {
    desc: 'This Pokemon\'s Speed is raised by 1 stage at the end of each full turn it has been on the field.',
    shortDesc: 'This Pokemon\'s Speed is raised 1 stage at the end of each full turn on the field.',
    onResidualOrder: 26,
    onResidualSubOrder: 1,
    onResidual (pokemon) {
      if (pokemon.activeTurns) {
        this.boost({spe: 1});
      }
    },
    id: 'speedboost',
    name: 'Speed Boost',
    rating: 4.5,
    num: 3
  },
  {
    shortDesc: 'This Pokemon\'s attacking stat is doubled against a target that switched in this turn.',
    onModifyAtkPriority: 5,
    onModifyAtk (defender) {
      if (!defender.activeTurns) {
        this.debug('Stakeout boost');

        return this.chainModify(2);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (defender) {
      if (!defender.activeTurns) {
        this.debug('Stakeout boost');

        return this.chainModify(2);
      }
    },
    id: 'stakeout',
    name: 'Stakeout',
    rating: 2.5,
    num: 198
  },
  {
    shortDesc: 'This Pokemon moves last among Pokemon using the same or greater priority moves.',
    onModifyPriority (priority) {
      return Math.round(priority) - 0.1;
    },
    id: 'stall',
    name: 'Stall',
    rating: -1,
    num: 100
  },
  {
    shortDesc: 'This Pokemon\'s Defense is raised by 1 stage after it is damaged by a move.',
    onAfterDamage (effect) {
      if (effect && effect.effectType === 'Move' && effect.id !== 'confused') {
        this.boost({def: 1});
      }
    },
    id: 'stamina',
    name: 'Stamina',
    rating: 3,
    num: 192
  },
  {
    desc: 'If this Pokemon is an Aegislash, it changes to Blade Forme before attempting to use an attacking move, and changes to Shield Forme before attempting to use King\'s Shield.',
    shortDesc: 'If Aegislash, changes Forme to Blade before attacks and Shield before King\'s Shield.',
    onBeforeMovePriority: 0.5,
    onBeforeMove (attacker, move) {
      if (attacker.template.baseSpecies !== 'Aegislash' || attacker.transformed) {
        return;
      }
      if (move.category === 'Status' && move.id !== 'kingsshield') {
        return;
      }
      const targetSpecies = move.id === 'kingsshield' ? 'Aegislash' : 'Aegislash-Blade';

      if (attacker.template.species !== targetSpecies) {
        attacker.formeChange(targetSpecies);
      }
    },
    id: 'stancechange',
    name: 'Stance Change',
    rating: 5,
    num: 176
  },
  {
    shortDesc: '30% chance a Pokemon making contact with this Pokemon will be paralyzed.',
    onAfterDamage (target, source, move) {
      if (move && move.flags.contact) {
        if (this.randomChance(3, 10)) {
          source.trySetStatus('par', target);
        }
      }
    },
    id: 'static',
    name: 'Static',
    rating: 2,
    num: 9
  },
  {
    shortDesc: 'If this Pokemon flinches, its Speed is raised by 1 stage.',
    onFlinch () {
      this.boost({spe: 1});
    },
    id: 'steadfast',
    name: 'Steadfast',
    rating: 1,
    num: 80
  },
  {
    shortDesc: 'This Pokemon\'s attacking stat is multiplied by 1.5 while using a Steel-type attack.',
    onModifyAtkPriority: 5,
    onModifyAtk (move) {
      if (move.type === 'Steel') {
        this.debug('Steelworker boost');

        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (move) {
      if (move.type === 'Steel') {
        this.debug('Steelworker boost');

        return this.chainModify(1.5);
      }
    },
    id: 'steelworker',
    name: 'Steelworker',
    rating: 3,
    num: 200
  },
  {
    shortDesc: 'This Pokemon\'s attacks without a chance to flinch have a 10% chance to flinch.',
    onModifyMovePriority: -1,
    onModifyMove (move) {
      if (move.category !== 'Status') {
        this.debug('Adding Stench flinch');
        if (!move.secondaries) {
          move.secondaries = [];
        }
        for (const secondary of move.secondaries) {
          if (secondary.volatileStatus === 'flinch') {
            return;
          }
        }
        move.secondaries.push({
          chance: 10,
          volatileStatus: 'flinch'
        });
      }
    },
    id: 'stench',
    name: 'Stench',
    rating: 0.5,
    num: 1
  },
  {
    shortDesc: 'This Pokemon cannot lose its held item due to another Pokemon\'s attack.',
    onTakeItem (pokemon, source) {
      if (this.suppressingAttackEvents() && pokemon !== this.activePokemon || !pokemon.hp || pokemon.item === 'stickybarb') {
        return;
      }
      if (!this.activeMove) {
        throw new Error('Battle.activeMove is null');
      }
      if ((source && source !== pokemon) || this.activeMove.id === 'knockoff') {
        this.add('-activate', pokemon, 'ability: Sticky Hold');

        return false;
      }
    },
    id: 'stickyhold',
    name: 'Sticky Hold',
    rating: 1.5,
    num: 60
  },
  {
    desc: 'This Pokemon is immune to Water-type moves and raises its Special Attack by 1 stage when hit by a Water-type move. If this Pokemon is not the target of a single-target Water-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move.',
    shortDesc: 'This Pokemon draws Water moves to itself to raise Sp. Atk by 1; Water immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Water') {
        if (!this.boost({spa: 1})) {
          this.add('-immune', target, '[msg]', '[from] ability: Storm Drain');
        }

        return null;
      }
    },
    onAnyRedirectTarget (target, source, move) {
      if (move.type !== 'Water' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
        return;
      }
      if (this.validTarget(this.effectData.target, source, move.target)) {
        if (this.effectData.target !== target) {
          this.add('-activate', this.effectData.target, 'ability: Storm Drain');
        }

        return this.effectData.target;
      }
    },
    id: 'stormdrain',
    name: 'Storm Drain',
    rating: 3.5,
    num: 114
  },
  {
    desc: 'This Pokemon\'s bite-based attacks have their power multiplied by 1.5.',
    shortDesc: 'This Pokemon\'s bite-based attacks have 1.5x power. Bug Bite is not boosted.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.flags.bite) {
        return this.chainModify(1.5);
      }
    },
    id: 'strongjaw',
    name: 'Strong Jaw',
    rating: 3,
    num: 173
  },
  {
    desc: 'If this Pokemon is at full HP, it survives one hit with at least 1 HP. OHKO moves fail when used against this Pokemon.',
    shortDesc: 'If this Pokemon is at full HP, it survives one hit with at least 1 HP. Immune to OHKO.',
    onTryHit (pokemon, move) {
      if (move.ohko) {
        this.add('-immune', pokemon, '[msg]', '[from] ability: Sturdy');

        return null;
      }
    },
    onDamagePriority: -100,
    onDamage (damage, target, effect) {
      if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
        this.add('-ability', target, 'Sturdy');

        return target.hp - 1;
      }
    },
    id: 'sturdy',
    name: 'Sturdy',
    rating: 3,
    num: 5
  },
  {
    shortDesc: 'This Pokemon cannot be forced to switch out by another Pokemon\'s attack or item.',
    onDragOutPriority: 1,
    onDragOut (pokemon) {
      this.add('-activate', pokemon, 'ability: Suction Cups');

      return null;
    },
    id: 'suctioncups',
    name: 'Suction Cups',
    rating: 1.5,
    num: 21
  },
  {
    shortDesc: 'This Pokemon\'s critical hit ratio is raised by 1 stage.',
    onModifyCritRatio (critRatio) {
      return critRatio + 1;
    },
    id: 'superluck',
    name: 'Super Luck',
    rating: 1.5,
    num: 105
  },
  {
    shortDesc: 'If Electric Terrain is active, this Pokemon\'s Speed is doubled.',
    onModifySpe () {
      if (this.isTerrain('electricterrain')) {
        return this.chainModify(2);
      }
    },
    id: 'surgesurfer',
    name: 'Surge Surfer',
    rating: 2,
    num: 207
  },
  {
    desc: 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Bug-type attack.',
    shortDesc: 'At 1/3 or less of its max HP, this Pokemon\'s attacking stat is 1.5x with Bug attacks.',
    onModifyAtkPriority: 5,
    onModifyAtk (attacker, move) {
      if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Swarm boost');

        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (attacker, move) {
      if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Swarm boost');

        return this.chainModify(1.5);
      }
    },
    id: 'swarm',
    name: 'Swarm',
    rating: 2,
    num: 68
  },
  {
    shortDesc: 'This Pokemon and its allies cannot fall asleep.',
    id: 'sweetveil',
    name: 'Sweet Veil',
    onAllySetStatus (status, target) {
      if (status.id === 'slp') {
        this.debug('Sweet Veil interrupts sleep');
        this.add('-activate', this.effectData.target, 'ability: Sweet Veil', `[of] ${target}`);

        return null;
      }
    },
    onAllyTryAddVolatile (status, target) {
      if (status.id === 'yawn') {
        this.debug('Sweet Veil blocking yawn');
        this.add('-activate', this.effectData.target, 'ability: Sweet Veil', `[of] ${target}`);

        return null;
      }
    },
    rating: 2,
    num: 175
  },
  {
    shortDesc: 'If Rain Dance is active, this Pokemon\'s Speed is doubled.',
    onModifySpe () {
      if (this.isWeather(['raindance', 'primordialsea'])) {
        return this.chainModify(2);
      }
    },
    id: 'swiftswim',
    name: 'Swift Swim',
    rating: 3,
    num: 33
  },
  {
    desc: 'If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally\'s item was stolen or knocked off.',
    shortDesc: 'If an ally uses its item, this Pokemon gives its item to that ally immediately.',
    onAllyAfterUseItem (item, pokemon) {
      let sourceItem = this.effectData.target.getItem();

      if (!sourceItem) {
        return;
      }
      if (!this.singleEvent('TakeItem', item, this.effectData.target.itemData, this.effectData.target, pokemon, this.effectData, item)) {
        return;
      }
      sourceItem = this.effectData.target.takeItem();
      if (!sourceItem) {
        return;
      }
      if (pokemon.setItem(sourceItem)) {
        this.add('-activate', this.effectData.target, 'ability: Symbiosis', sourceItem, `[of] ${pokemon}`);
      }
    },
    id: 'symbiosis',
    name: 'Symbiosis',
    rating: 0,
    num: 180
  },
  {
    desc: 'If another Pokemon burns, paralyzes, poisons, or badly poisons this Pokemon, that Pokemon receives the same major status condition.',
    shortDesc: 'If another Pokemon burns/poisons/paralyzes this Pokemon, it also gets that status.',
    onAfterSetStatus (status, target, source, effect) {
      if (!source || source === target) {
        return;
      }
      if (effect && effect.id === 'toxicspikes') {
        return;
      }
      if (status.id === 'slp' || status.id === 'frz') {
        return;
      }
      this.add('-activate', target, 'ability: Synchronize');
      source.trySetStatus(status, target, {
        status: status.id,
        id: 'synchronize'
      });
    },
    id: 'synchronize',
    name: 'Synchronize',
    rating: 2,
    num: 28
  },
  {
    shortDesc: 'This Pokemon\'s evasiveness is doubled as long as it is confused.',
    onModifyAccuracy (accuracy, target) {
      if (typeof accuracy !== 'number') {
        return;
      }
      if (target && target.volatiles.confusion) {
        this.debug('Tangled Feet - decreasing accuracy');

        return accuracy * 0.5;
      }
    },
    id: 'tangledfeet',
    name: 'Tangled Feet',
    rating: 1,
    num: 77
  },
  {
    shortDesc: 'Pokemon making contact with this Pokemon have their Speed lowered by 1 stage.',
    onAfterDamage (target, source, effect) {
      if (effect && effect.flags.contact) {
        this.add('-ability', target, 'Tangling Hair');
        this.boost({spe: -1}, source, target, null, false, true);
      }
    },
    id: 'tanglinghair',
    name: 'Tangling Hair',
    rating: 2.5,
    num: 221
  },
  {
    desc: 'This Pokemon\'s moves of 60 power or less have their power multiplied by 1.5. Does affect Struggle.',
    shortDesc: 'This Pokemon\'s moves of 60 power or less have 1.5x power. Includes Struggle.',
    onBasePowerPriority: 8,
    onBasePower (basePower) {
      if (basePower <= 60) {
        this.debug('Technician boost');

        return this.chainModify(1.5);
      }
    },
    id: 'technician',
    name: 'Technician',
    rating: 4,
    num: 101
  },
  {
    shortDesc: 'This Pokemon does not take damage from attacks made by its allies.',
    onTryHit (target, source, move) {
      if (target !== source && target.side === source.side && move.category !== 'Status') {
        this.add('-activate', target, 'ability: Telepathy');

        return null;
      }
    },
    id: 'telepathy',
    name: 'Telepathy',
    rating: 0,
    num: 140
  },
  {
    shortDesc: 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Teravolt');
    },
    onModifyMove (move) {
      move.ignoreAbility = true;
    },
    id: 'teravolt',
    name: 'Teravolt',
    rating: 3.5,
    num: 164
  },
  {
    desc: 'If a Pokemon uses a Fire- or Ice-type attack against this Pokemon, that Pokemon\'s attacking stat is halved when calculating the damage to this Pokemon.',
    shortDesc: 'Fire/Ice-type moves against this Pokemon deal damage with a halved attacking stat.',
    onModifyAtkPriority: 6,
    onSourceModifyAtk (move) {
      if (move.type === 'Ice' || move.type === 'Fire') {
        this.debug('Thick Fat weaken');

        return this.chainModify(0.5);
      }
    },
    onModifySpAPriority: 5,
    onSourceModifySpA (move) {
      if (move.type === 'Ice' || move.type === 'Fire') {
        this.debug('Thick Fat weaken');

        return this.chainModify(0.5);
      }
    },
    id: 'thickfat',
    name: 'Thick Fat',
    rating: 3.5,
    num: 47
  },
  {
    shortDesc: 'This Pokemon\'s attacks that are not very effective on a target deal double damage.',
    onModifyDamage (move) {
      if (move.typeMod < 0) {
        this.debug('Tinted Lens boost');

        return this.chainModify(2);
      }
    },
    id: 'tintedlens',
    name: 'Tinted Lens',
    rating: 3.5,
    num: 110
  },
  {
    desc: 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Water-type attack.',
    shortDesc: 'At 1/3 or less of its max HP, this Pokemon\'s attacking stat is 1.5x with Water attacks.',
    onModifyAtkPriority: 5,
    onModifyAtk (attacker, move) {
      if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Torrent boost');

        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 5,
    onModifySpA (attacker, move) {
      if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
        this.debug('Torrent boost');

        return this.chainModify(1.5);
      }
    },
    id: 'torrent',
    name: 'Torrent',
    rating: 2,
    num: 67
  },
  {
    desc: 'While this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5.',
    shortDesc: 'While this Pokemon is poisoned, its physical attacks have 1.5x power.',
    onBasePowerPriority: 8,
    onBasePower (attacker, move) {
      if ((attacker.status === 'psn' || attacker.status === 'tox') && move.category === 'Physical') {
        return this.chainModify(1.5);
      }
    },
    id: 'toxicboost',
    name: 'Toxic Boost',
    rating: 3,
    num: 137
  },
  {
    shortDesc: 'This Pokemon\'s contact moves have their power multiplied by 1.3.',
    onBasePowerPriority: 8,
    onBasePower (move) {
      if (move.flags.contact) {
        return this.chainModify([0x14CD, 0x1000]);
      }
    },
    id: 'toughclaws',
    name: 'Tough Claws',
    rating: 3.5,
    num: 181
  },
  {
    desc: 'On switch-in, or when this Pokemon acquires this ability, this Pokemon copies a random adjacent opposing Pokemon\'s Ability. However, if one or more adjacent Pokemon has the Ability "No Ability", Trace won\'t copy anything even if there is another valid Ability it could normally copy. Otherwise, if there is no Ability that can be copied at that time, this Ability will activate as soon as an Ability can be copied. Abilities that cannot be copied are the previously mentioned "No Ability", as well as Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Schooling, Stance Change, Trace, and Zen Mode.',
    shortDesc: 'On switch-in, or when it can, this Pokemon copies a random adjacent foe\'s Ability.',
    onStart (pokemon) {
      if (pokemon.side.foe.active.some(foeActive => foeActive && this.isAdjacent(pokemon, foeActive) && foeActive.ability === 'noability')) {
        this.effectData.gaveUp = true;
      }
    },
    onUpdate (pokemon) {
      if (!pokemon.isStarted || this.effectData.gaveUp) {
        return;
      }
      const possibleTargets = pokemon.side.foe.active.filter(foeActive => foeActive && this.isAdjacent(pokemon, foeActive));

      while (possibleTargets.length) {
        let rand = 0;

        if (possibleTargets.length > 1) {
          rand = this.random(possibleTargets.length);
        }
        const target = possibleTargets[rand];
        const ability = this.getAbility(target.ability);
        const bannedAbilities = ['noability', 'battlebond', 'comatose', 'disguise', 'flowergift', 'forecast', 'illusion', 'imposter', 'multitype', 'powerconstruct', 'powerofalchemy', 'receiver', 'rkssystem', 'schooling', 'shieldsdown', 'stancechange', 'trace', 'zenmode'];

        if (bannedAbilities.includes(target.ability)) {
          possibleTargets.splice(rand, 1);
          continue;
        }
        this.add('-ability', pokemon, ability, '[from] ability: Trace', `[of] ${target}`);
        pokemon.setAbility(ability);

        return;
      }
    },
    id: 'trace',
    name: 'Trace',
    rating: 3,
    num: 36
  },
  {
    shortDesc: 'This Pokemon\'s healing moves have their priority increased by 3.',
    onModifyPriority (priority, move) {
      if (move && move.flags.heal) {
        return priority + 3;
      }
    },
    id: 'triage',
    name: 'Triage',
    rating: 3.5,
    num: 205
  },
  {
    shortDesc: 'This Pokemon skips every other turn instead of using a move.',
    onBeforeMovePriority: 9,
    onBeforeMove (pokemon) {
      if (pokemon.removeVolatile('truant')) {
        this.add('cant', pokemon, 'ability: Truant');

        return false;
      }
      pokemon.addVolatile('truant');
    },
    effect: {},
    id: 'truant',
    name: 'Truant',
    rating: -2,
    num: 54
  },
  {
    shortDesc: 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
    onStart (pokemon) {
      this.add('-ability', pokemon, 'Turboblaze');
    },
    onModifyMove (move) {
      move.ignoreAbility = true;
    },
    id: 'turboblaze',
    name: 'Turboblaze',
    rating: 3.5,
    num: 163
  },
  {
    desc: 'This Pokemon ignores other Pokemon\'s Attack, Special Attack, and accuracy stat stages when taking damage, and ignores other Pokemon\'s Defense, Special Defense, and evasiveness stat stages when dealing damage.',
    shortDesc: 'This Pokemon ignores other Pokemon\'s stat stages when taking or doing damage.',
    id: 'unaware',
    name: 'Unaware',
    onAnyModifyBoost (boosts, target) {
      const source = this.effectData.target;

      if (source === target) {
        return;
      }
      if (source === this.activePokemon && target === this.activeTarget) {
        boosts.def = 0;
        boosts.spd = 0;
        boosts.evasion = 0;
      }
      if (target === this.activePokemon && source === this.activeTarget) {
        boosts.atk = 0;
        boosts.spa = 0;
        boosts.accuracy = 0;
      }
    },
    rating: 3,
    num: 109
  },
  {
    desc: 'If this Pokemon loses its held item for any reason, its Speed is doubled. This boost is lost if it switches out or gains a new item or Ability.',
    shortDesc: 'Speed is doubled on held item loss; boost is lost if it switches, gets new item/Ability.',
    onAfterUseItem (pokemon) {
      if (pokemon !== this.effectData.target) {
        return;
      }
      pokemon.addVolatile('unburden');
    },
    onTakeItem (pokemon) {
      pokemon.addVolatile('unburden');
    },
    onEnd (pokemon) {
      pokemon.removeVolatile('unburden');
    },
    effect: {
      onModifySpe (pokemon) {
        if (!pokemon.item) {
          return this.chainModify(2);
        }
      }
    },
    id: 'unburden',
    name: 'Unburden',
    rating: 3.5,
    num: 84
  },
  {
    shortDesc: 'While this Pokemon is active, it prevents opposing Pokemon from using their Berries.',
    onPreStart (pokemon) {
      this.add('-ability', pokemon, 'Unnerve', pokemon.side.foe);
    },
    onFoeTryEatItem: false,
    id: 'unnerve',
    name: 'Unnerve',
    rating: 1.5,
    num: 127
  },
  {
    shortDesc: 'This Pokemon and its allies\' moves have their accuracy multiplied by 1.1.',
    onAllyModifyMove (move) {
      if (typeof move.accuracy === 'number') {
        move.accuracy *= 1.1;
      }
    },
    id: 'victorystar',
    name: 'Victory Star',
    rating: 3,
    num: 162
  },
  {
    shortDesc: 'This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.',
    onUpdate (pokemon) {
      if (pokemon.status === 'slp') {
        this.add('-activate', pokemon, 'ability: Vital Spirit');
        pokemon.cureStatus();
      }
    },
    onSetStatus (status, target, effect) {
      if (status.id !== 'slp') {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Vital Spirit');

      return false;
    },
    id: 'vitalspirit',
    name: 'Vital Spirit',
    rating: 2,
    num: 72
  },
  {
    desc: 'This Pokemon is immune to Electric-type moves and restores 1/4 of its maximum HP, rounded down, when hit by an Electric-type move.',
    shortDesc: 'This Pokemon heals 1/4 of its max HP when hit by Electric moves; Electric immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Electric') {
        if (!this.heal(target.maxhp / 4)) {
          this.add('-immune', target, '[msg]', '[from] ability: Volt Absorb');
        }

        return null;
      }
    },
    id: 'voltabsorb',
    name: 'Volt Absorb',
    rating: 3.5,
    num: 10
  },
  {
    desc: 'This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move.',
    shortDesc: 'This Pokemon heals 1/4 of its max HP when hit by Water moves; Water immunity.',
    onTryHit (target, source, move) {
      if (target !== source && move.type === 'Water') {
        if (!this.heal(target.maxhp / 4)) {
          this.add('-immune', target, '[msg]', '[from] ability: Water Absorb');
        }

        return null;
      }
    },
    id: 'waterabsorb',
    name: 'Water Absorb',
    rating: 3.5,
    num: 11
  },
  {
    desc: 'This Pokemon\'s attacking stat is doubled while using a Water-type attack. If a Pokemon uses a Fire-type attack against this Pokemon, that Pokemon\'s attacking stat is halved when calculating the damage to this Pokemon. This Pokemon cannot be burned. Gaining this Ability while burned cures it.',
    shortDesc: 'This Pokemon\'s Water power is 2x; it can\'t be burned; Fire power against it is halved.',
    onModifyAtkPriority: 5,
    onSourceModifyAtk (move) {
      if (move.type === 'Fire') {
        return this.chainModify(0.5);
      }
    },
    onModifySpAPriority: 5,
    onSourceModifySpA (move) {
      if (move.type === 'Fire') {
        return this.chainModify(0.5);
      }
    },
    onModifyAtk (move) {
      if (move.type === 'Water') {
        return this.chainModify(2);
      }
    },
    onModifySpA (move) {
      if (move.type === 'Water') {
        return this.chainModify(2);
      }
    },
    onUpdate (pokemon) {
      if (pokemon.status === 'brn') {
        this.add('-activate', pokemon, 'ability: Water Bubble');
        pokemon.cureStatus();
      }
    },
    onSetStatus (status, target, effect) {
      if (status.id !== 'brn') {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Water Bubble');

      return false;
    },
    id: 'waterbubble',
    name: 'Water Bubble',
    rating: 4,
    num: 199
  },
  {
    shortDesc: 'This Pokemon\'s Defense is raised 2 stages after it is damaged by a Water-type move.',
    onAfterDamage (effect) {
      if (effect && effect.type === 'Water') {
        this.boost({def: 2});
      }
    },
    id: 'watercompaction',
    name: 'Water Compaction',
    rating: 2,
    num: 195
  },
  {
    shortDesc: 'This Pokemon cannot be burned. Gaining this Ability while burned cures it.',
    onUpdate (pokemon) {
      if (pokemon.status === 'brn') {
        this.add('-activate', pokemon, 'ability: Water Veil');
        pokemon.cureStatus();
      }
    },
    onSetStatus (status, target, effect) {
      if (status.id !== 'brn') {
        return;
      }
      if (!effect || !effect.status) {
        return false;
      }
      this.add('-immune', target, '[msg]', '[from] ability: Water Veil');

      return false;
    },
    id: 'waterveil',
    name: 'Water Veil',
    rating: 2,
    num: 41
  },
  {
    desc: 'If a physical attack hits this Pokemon, its Defense is lowered by 1 stage and its Speed is raised by 2 stages.',
    shortDesc: 'If a physical attack hits this Pokemon, Defense is lowered by 1, Speed is raised by 2.',
    onAfterDamage (target, move) {
      if (move.category === 'Physical') {
        this.boost({
          def: -1,
          spe: 2
        }, target, target);
      }
    },
    id: 'weakarmor',
    name: 'Weak Armor',
    rating: 1,
    num: 133
  },
  {
    shortDesc: 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
    onBoost (boost, target, source, effect) {
      if (source && target === source) {
        return;
      }
      let showMsg = false;

      for (const i in boost) {
        if (boost[i] < 0) {
          delete boost[i];
          showMsg = true;
        }
      }
      if (showMsg && !effect.secondaries) {
        this.add('-fail', target, 'unboost', '[from] ability: White Smoke', `[of] ${target}`);
      }
    },
    id: 'whitesmoke',
    name: 'White Smoke',
    rating: 2,
    num: 73
  },
  {
    desc: 'When this Pokemon has more than 1/2 its maximum HP and takes damage bringing it to 1/2 or less of its maximum HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage.',
    shortDesc: 'This Pokemon switches out when it reaches 1/2 or less of its maximum HP.',
    onAfterMoveSecondary (target, source, move) {
      if (!source || source === target || !target.hp || !move.totalDamage) {
        return;
      }
      if (target.hp <= target.maxhp / 2 && target.hp + move.totalDamage > target.maxhp / 2) {
        if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) {
          return;
        }
        target.switchFlag = true;
        source.switchFlag = false;
        this.add('-activate', target, 'ability: Wimp Out');
      }
    },
    onAfterDamage (damage, target, effect) {
      if (!target.hp || effect.effectType === 'Move') {
        return;
      }
      if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
        if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) {
          return;
        }
        target.switchFlag = true;
        this.add('-activate', target, 'ability: Wimp Out');
      }
    },
    id: 'wimpout',
    name: 'Wimp Out',
    rating: 2,
    num: 193
  },
  {
    shortDesc: 'This Pokemon can only be damaged by supereffective moves and indirect damage.',
    onTryHit (target, source, move) {
      if (target === source || move.category === 'Status' || move.type === '???' || move.id === 'struggle') {
        return;
      }
      this.debug(`Wonder Guard immunity: ${move.id}`);
      if (target.runEffectiveness(move) <= 0) {
        this.add('-immune', target, '[msg]', '[from] ability: Wonder Guard');

        return null;
      }
    },
    id: 'wonderguard',
    name: 'Wonder Guard',
    rating: 5,
    num: 25
  },
  {
    desc: 'All non-damaging moves that check accuracy have their accuracy changed to 50% when used on this Pokemon. This change is done before any other accuracy modifying effects.',
    shortDesc: 'Status moves with accuracy checks are 50% accurate when used on this Pokemon.',
    onModifyAccuracyPriority: 10,
    onModifyAccuracy (move) {
      if (move.category === 'Status' && typeof move.accuracy === 'number') {
        this.debug('Wonder Skin - setting accuracy to 50');

        return 50;
      }
    },
    id: 'wonderskin',
    name: 'Wonder Skin',
    rating: 2,
    num: 147
  },
  {
    desc: 'If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan\'s HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode. If Darmanitan loses this Ability while in Zen Mode it reverts to Standard Mode immediately.',
    shortDesc: 'If Darmanitan, at end of turn changes Mode to Standard if > 1/2 max HP, else Zen.',
    onResidualOrder: 27,
    onResidual (pokemon) {
      if (pokemon.baseTemplate.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.template.speciesid === 'darmanitan') {
        pokemon.addVolatile('zenmode');
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.template.speciesid === 'darmanitanzen') {
        pokemon.addVolatile('zenmode');
        pokemon.removeVolatile('zenmode');
      }
    },
    onEnd (pokemon) {
      if (!pokemon.volatiles.zenmode || !pokemon.hp) {
        return;
      }
      pokemon.transformed = false;
      delete pokemon.volatiles.zenmode;
      pokemon.formeChange('Darmanitan', this.effect, false, '[silent]');
    },
    effect: {
      onStart (pokemon) {
        if (pokemon.template.speciesid !== 'darmanitanzen') {
          pokemon.formeChange('Darmanitan-Zen');
        }
      },
      onEnd (pokemon) {
        pokemon.formeChange('Darmanitan');
      }
    },
    id: 'zenmode',
    name: 'Zen Mode',
    rating: -1,
    num: 161
  },

  {
    shortDesc: 'On switch-in, this Pokemon avoids all Rock-type attacks and Stealth Rock.',
    onDamage (effect) {
      if (effect && effect.id === 'stealthrock') {
        return false;
      }
    },
    onTryHit (target, move) {
      if (move.type === 'Rock' && !target.activeTurns) {
        this.add('-immune', target, '[msg]', '[from] ability: Mountaineer');

        return null;
      }
    },
    id: 'mountaineer',
    isNonstandard: true,
    name: 'Mountaineer',
    rating: 3.5,
    num: -2
  },
  {
    desc: 'On switch-in, this Pokemon blocks certain status moves and instead uses the move against the original user.',
    shortDesc: 'On switch-in, blocks certain status moves and bounces them back to the user.',
    id: 'rebound',
    isNonstandard: true,
    name: 'Rebound',
    onTryHitPriority: 1,
    onTryHit (target, source, move) {
      if (this.effectData.target.activeTurns) {
        return;
      }
      if (target === source || move.hasBounced || !move.flags.reflectable) {
        return;
      }
      const newMove = this.getMoveCopy(move.id);

      newMove.hasBounced = true;
      this.useMove(newMove, target, source);

      return null;
    },
    onAllyTryHitSide (target, source, move) {
      if (this.effectData.target.activeTurns) {
        return;
      }
      if (target.side === source.side || move.hasBounced || !move.flags.reflectable) {
        return;
      }
      const newMove = this.getMoveCopy(move.id);

      newMove.hasBounced = true;
      this.useMove(newMove, this.effectData.target, source);

      return null;
    },
    effect: {duration: 1},
    rating: 3.5,
    num: -3
  },
  {
    desc: 'The duration of Gravity, Heal Block, Magic Room, Safeguard, Tailwind, Trick Room, and Wonder Room is increased by 2 turns if the effect is started by this Pokemon.',
    shortDesc: 'When used, Gravity/Heal Block/Safeguard/Tailwind/Room effects last 2 more turns.',
    id: 'persistent',
    isNonstandard: true,
    name: 'Persistent',

    rating: 3.5,
    num: -4
  }
];

module.exports = {BattleAbilities};