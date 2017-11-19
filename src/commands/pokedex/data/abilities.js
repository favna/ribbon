/* eslint-disable max-lines, max-len */

/*
 *   This file is part of discord-self-bot
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
 */

const BattleAbilities = {
	'adaptability': {
		'desc': 'This Pokemon\'s moves that match one of its types have a same-type attack bonus (STAB) of 2 instead of 1.5.',
		'shortDesc': 'This Pokemon\'s same-type attack bonus (STAB) is 2 instead of 1.5.',
		'id': 'adaptability',
		'name': 'Adaptability',
		'num': 91
	},
	'aftermath': {
		'desc': 'If this Pokemon is knocked out with a contact move, that move\'s user loses 1/4 of its maximum HP, rounded down. If any active Pokemon has the Ability Damp, this effect is prevented.',
		'shortDesc': 'If this Pokemon is KOed with a contact move, that move\'s user loses 1/4 its max HP.',
		'id': 'aftermath',
		'name': 'Aftermath',
		'num': 106
	},
	'aerilate': {
		'desc': 'This Pokemon\'s Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
		'shortDesc': 'This Pokemon\'s Normal-type moves become Flying type and have 1.2x power.',
		'id': 'aerilate',
		'name': 'Aerilate',
		'num': 185
	},
	'airlock': {
		'shortDesc': 'While this Pokemon is active, the effects of weather conditions are disabled.',
		'suppressWeather': true,
		'id': 'airlock',
		'name': 'Air Lock',
		'num': 76
	},
	'analytic': {
		'desc': 'The power of this Pokemon\'s move is multiplied by 1.3 if it is the last to move in a turn. Does not affect Doom Desire and Future Sight.',
		'shortDesc': 'This Pokemon\'s attacks have 1.3x power if it is the last to move in a turn.',
		'id': 'analytic',
		'name': 'Analytic',
		'num': 148
	},
	'angerpoint': {
		'desc': 'If this Pokemon, but not its substitute, is struck by a critical hit, its Attack is raised by 12 stages.',
		'shortDesc': 'If this Pokemon (not its substitute) takes a critical hit, its Attack is raised 12 stages.',
		'id': 'angerpoint',
		'name': 'Anger Point',
		'num': 83
	},
	'anticipation': {
		'desc': 'On switch-in, this Pokemon is alerted if any opposing Pokemon has an attack that is super effective on this Pokemon, or an OHKO move. Counter, Metal Burst, and Mirror Coat count as attacking moves of their respective types, while Hidden Power, Judgment, Natural Gift, Techno Blast, and Weather Ball are considered Normal-type moves.',
		'shortDesc': 'On switch-in, this Pokemon shudders if any foe has a supereffective or OHKO move.',
		'id': 'anticipation',
		'name': 'Anticipation',
		'num': 107
	},
	'arenatrap': {
		'desc': 'Prevents adjacent opposing Pokemon from choosing to switch out unless they are immune to trapping or are airborne.',
		'shortDesc': 'Prevents adjacent foes from choosing to switch unless they are airborne.',
		'id': 'arenatrap',
		'name': 'Arena Trap',
		'num': 71
	},
	'aromaveil': {
		'desc': 'This Pokemon and its allies cannot be affected by Attract, Disable, Encore, Heal Block, Taunt, or Torment.',
		'shortDesc': 'Protects user/allies from Attract, Disable, Encore, Heal Block, Taunt, and Torment.',
		'id': 'aromaveil',
		'name': 'Aroma Veil',
		'num': 165
	},
	'aurabreak': {
		'desc': 'While this Pokemon is active, the effects of the Abilities Dark Aura and Fairy Aura are reversed, multiplying the power of Dark- and Fairy-type moves, respectively, by 3/4 instead of 1.33.',
		'shortDesc': 'While this Pokemon is active, the Dark Aura and Fairy Aura power modifier is 0.75x.',
		'id': 'aurabreak',
		'name': 'Aura Break',
		'num': 188
	},
	'baddreams': {
		'desc': 'Causes adjacent opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.',
		'shortDesc': 'Causes sleeping adjacent foes to lose 1/8 of their max HP at the end of each turn.',
		'id': 'baddreams',
		'name': 'Bad Dreams',
		'num': 123
	},
	'battery': {
		'shortDesc': 'This Pokemon\'s allies have the power of their special attacks multiplied by 1.3.',
		'id': 'battery',
		'name': 'Battery',
		'num': 217
	},
	'battlearmor': {
		'shortDesc': 'This Pokemon cannot be struck by a critical hit.',
		'onCriticalHit': false,
		'id': 'battlearmor',
		'name': 'Battle Armor',
		'num': 4
	},
	'battlebond': {
		'desc': 'If this Pokemon is a Greninja, it transforms into Ash-Greninja after knocking out a Pokemon. As Ash-Greninja, its Water Shuriken has 20 base power and always hits 3 times.',
		'shortDesc': 'After KOing a Pokemon: becomes Ash-Greninja, Water Shuriken: 20 power, hits 3x.',
		'id': 'battlebond',
		'name': 'Battle Bond',
		'num': 210
	},
	'beastboost': {
		'desc': 'This Pokemon\'s highest stat is raised by 1 stage if it attacks and knocks out another Pokemon.',
		'shortDesc': 'This Pokemon\'s highest stat is raised by 1 if it attacks and KOes another Pokemon.',
		'id': 'beastboost',
		'name': 'Beast Boost',
		'num': 224
	},
	'berserk': {
		'desc': 'This Pokemon\'s Special Attack is raised by 1 stage when it reaches 1/2 or less of its maximum HP.',
		'shortDesc': 'This Pokemon\'s Sp. Atk is raised by 1 when it reaches 1/2 or less of its max HP.',
		'id': 'berserk',
		'name': 'Berserk',
		'num': 201
	},
	'bigpecks': {
		'shortDesc': 'Prevents other Pokemon from lowering this Pokemon\'s Defense stat stage.',
		'id': 'bigpecks',
		'name': 'Big Pecks',
		'num': 145
	},
	'blaze': {
		'desc': 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Fire-type attack.',
		'shortDesc': 'When this Pokemon has 1/3 or less of its max HP, its Fire attacks do 1.5x damage.',
		'id': 'blaze',
		'name': 'Blaze',
		'num': 66
	},
	'bulletproof': {
		'desc': 'This Pokemon is immune to ballistic moves. Ballistic moves include Bullet Seed, Octazooka, Barrage, Rock Wrecker, Zap Cannon, Acid Spray, Aura Sphere, Focus Blast, and all moves with Ball or Bomb in their name.',
		'shortDesc': 'Makes user immune to ballistic moves (Shadow Ball, Sludge Bomb, Focus Blast, etc).',
		'id': 'bulletproof',
		'name': 'Bulletproof',
		'num': 171
	},
	'cheekpouch': {
		'desc': 'If this Pokemon eats a Berry, it restores 1/3 of its maximum HP, rounded down, in addition to the Berry\'s effect.',
		'shortDesc': 'If this Pokemon eats a Berry, it restores 1/3 of its max HP after the Berry\'s effect.',
		'id': 'cheekpouch',
		'name': 'Cheek Pouch',
		'num': 167
	},
	'chlorophyll': {
		'shortDesc': 'If Sunny Day is active, this Pokemon\'s Speed is doubled.',
		'id': 'chlorophyll',
		'name': 'Chlorophyll',
		'num': 34
	},
	'clearbody': {
		'shortDesc': 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
		'id': 'clearbody',
		'name': 'Clear Body',
		'num': 29
	},
	'cloudnine': {
		'shortDesc': 'While this Pokemon is active, the effects of weather conditions are disabled.',
		'suppressWeather': true,
		'id': 'cloudnine',
		'name': 'Cloud Nine',
		'num': 13
	},
	'colorchange': {
		'desc': 'This Pokemon\'s type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect.',
		'shortDesc': 'This Pokemon\'s type changes to the type of a move it\'s hit by, unless it has the type.',
		'id': 'colorchange',
		'name': 'Color Change',
		'num': 16
	},
	'comatose': {
		'shortDesc': 'This Pokemon cannot be statused, and is considered to be asleep.',
		'isUnbreakable': true,
		'id': 'comatose',
		'name': 'Comatose',
		'num': 213
	},
	'competitive': {
		'desc': 'This Pokemon\'s Special Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.',
		'shortDesc': 'This Pokemon\'s Sp. Atk is raised by 2 for each of its stats that is lowered by a foe.',
		'id': 'competitive',
		'name': 'Competitive',
		'num': 172
	},
	'compoundeyes': {
		'shortDesc': 'This Pokemon\'s moves have their accuracy multiplied by 1.3.',
		'id': 'compoundeyes',
		'name': 'Compound Eyes',
		'num': 14
	},
	'contrary': {
		'shortDesc': 'If this Pokemon has a stat stage raised it is lowered instead, and vice versa.',
		'id': 'contrary',
		'name': 'Contrary',
		'num': 126
	},
	'corrosion': {
		'shortDesc': 'This Pokemon can poison or badly poison other Pokemon regardless of their typing.',
		'id': 'corrosion',
		'name': 'Corrosion',
		'num': 212
	},
	'cursedbody': {
		'desc': 'If this Pokemon is hit by an attack, there is a 30% chance that move gets disabled unless one of the attacker\'s moves is already disabled.',
		'shortDesc': 'If this Pokemon is hit by an attack, there is a 30% chance that move gets disabled.',
		'id': 'cursedbody',
		'name': 'Cursed Body',
		'num': 130
	},
	'cutecharm': {
		'desc': 'There is a 30% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender.',
		'shortDesc': '30% chance of infatuating Pokemon of the opposite gender if they make contact.',
		'id': 'cutecharm',
		'name': 'Cute Charm',
		'num': 56
	},
	'damp': {
		'desc': 'While this Pokemon is active, Self-Destruct, Explosion, and the Ability Aftermath are prevented from having an effect.',
		'shortDesc': 'While this Pokemon is active, Self-Destruct, Explosion, and Aftermath have no effect.',
		'id': 'damp',
		'name': 'Damp',
		'num': 6
	},
	'dancer': {
		'desc': 'After another Pokemon uses a dance move, this Pokemon uses the same move. Moves used by this Ability cannot be copied again.',
		'shortDesc': 'After another Pokemon uses a dance move, this Pokemon uses the same move.',
		'id': 'dancer',
		'name': 'Dancer',
		'num': 216
	},
	'darkaura': {
		'desc': 'While this Pokemon is active, the power of Dark-type moves used by active Pokemon is multiplied by 1.33.',
		'shortDesc': 'While this Pokemon is active, a Dark move used by any Pokemon has 1.33x power.',
		'id': 'darkaura',
		'name': 'Dark Aura',
		'num': 186
	},
	'dazzling': {
		'desc': 'While this Pokemon is active, priority moves from opposing Pokemon targeted at allies are prevented from having an effect.',
		'shortDesc': 'While this Pokemon is active, allies are protected from opposing priority moves.',
		'id': 'dazzling',
		'name': 'Dazzling',
		'num': 219
	},
	'defeatist': {
		'desc': 'While this Pokemon has 1/2 or less of its maximum HP, its Attack and Special Attack are halved.',
		'shortDesc': 'While this Pokemon has 1/2 or less of its max HP, its Attack and Sp. Atk are halved.',
		'id': 'defeatist',
		'name': 'Defeatist',
		'num': 129
	},
	'defiant': {
		'desc': 'This Pokemon\'s Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.',
		'shortDesc': 'This Pokemon\'s Attack is raised by 2 for each of its stats that is lowered by a foe.',
		'id': 'defiant',
		'name': 'Defiant',
		'num': 128
	},
	'deltastream': {
		'desc': 'On switch-in, the weather becomes strong winds that remove the weaknesses of the Flying type from Flying-type Pokemon. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Desolate Land or Primordial Sea.',
		'shortDesc': 'On switch-in, strong winds begin until this Ability is not active in battle.',
		'id': 'deltastream',
		'name': 'Delta Stream',
		'num': 191
	},
	'desolateland': {
		'desc': 'On switch-in, the weather becomes extremely harsh sunlight that prevents damaging Water-type moves from executing, in addition to all the effects of Sunny Day. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Delta Stream or Primordial Sea.',
		'shortDesc': 'On switch-in, extremely harsh sunlight begins until this Ability is not active in battle.',
		'id': 'desolateland',
		'name': 'Desolate Land',
		'num': 190
	},
	'disguise': {
		'desc': 'If this Pokemon is a Mimikyu, it will take 0 damage the first time it is attacked in battle. It then changes to Busted Form.',
		'shortDesc': 'If this Pokemon is a Mimikyu, it takes 0 damage the first time it is attacked in battle.',
		'id': 'disguise',
		'name': 'Disguise',
		'num': 209
	},
	'download': {
		'desc': 'On switch-in, this Pokemon\'s Attack or Special Attack is raised by 1 stage based on the weaker combined defensive stat of all opposing Pokemon. Attack is raised if their Defense is lower, and Special Attack is raised if their Special Defense is the same or lower.',
		'shortDesc': 'On switch-in, Attack or Sp. Atk is raised 1 stage based on the foes\' weaker Defense.',
		'id': 'download',
		'name': 'Download',
		'num': 88
	},
	'drizzle': {
		'shortDesc': 'On switch-in, this Pokemon summons Rain Dance.',
		'id': 'drizzle',
		'name': 'Drizzle',
		'num': 2
	},
	'drought': {
		'shortDesc': 'On switch-in, this Pokemon summons Sunny Day.',
		'id': 'drought',
		'name': 'Drought',
		'num': 70
	},
	'dryskin': {
		'desc': 'This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move. The power of Fire-type moves is multiplied by 1.25 when used on this Pokemon. At the end of each turn, this Pokemon restores 1/8 of its maximum HP, rounded down, if the weather is Rain Dance, and loses 1/8 of its maximum HP, rounded down, if the weather is Sunny Day.',
		'shortDesc': 'This Pokemon is healed 1/4 by Water, 1/8 by Rain; is hurt 1.25x by Fire, 1/8 by Sun.',
		'id': 'dryskin',
		'name': 'Dry Skin',
		'num': 87
	},
	'earlybird': {
		'shortDesc': 'This Pokemon\'s sleep counter drops by 2 instead of 1.',
		'id': 'earlybird',
		'name': 'Early Bird',
		'num': 48
	},
	'effectspore': {
		'desc': '30% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep.',
		'shortDesc': '30% chance of poison/paralysis/sleep on others making contact with this Pokemon.',
		'id': 'effectspore',
		'name': 'Effect Spore',
		'num': 27
	},
	'electricsurge': {
		'shortDesc': 'On switch-in, this Pokemon summons Electric Terrain.',
		'id': 'electricsurge',
		'name': 'Electric Surge',
		'num': 226
	},
	'emergencyexit': {
		'shortDesc': 'This Pokemon switches out when it reaches 1/2 or less of its maximum HP.',
		'id': 'emergencyexit',
		'name': 'Emergency Exit',
		'num': 194
	},
	'fairyaura': {
		'desc': 'While this Pokemon is active, the power of Fairy-type moves used by active Pokemon is multiplied by 1.33.',
		'shortDesc': 'While this Pokemon is active, a Fairy move used by any Pokemon has 1.33x power.',
		'id': 'fairyaura',
		'name': 'Fairy Aura',
		'num': 187
	},
	'filter': {
		'shortDesc': 'This Pokemon receives 3/4 damage from supereffective attacks.',
		'id': 'filter',
		'name': 'Filter',
		'num': 111
	},
	'flamebody': {
		'shortDesc': '30% chance a Pokemon making contact with this Pokemon will be burned.',
		'id': 'flamebody',
		'name': 'Flame Body',
		'num': 49
	},
	'flareboost': {
		'desc': 'While this Pokemon is burned, the power of its special attacks is multiplied by 1.5.',
		'shortDesc': 'While this Pokemon is burned, its special attacks have 1.5x power.',
		'id': 'flareboost',
		'name': 'Flare Boost',
		'num': 138
	},
	'flashfire': {
		'desc': 'This Pokemon is immune to Fire-type moves. The first time it is hit by a Fire-type move, its attacking stat is multiplied by 1.5 while using a Fire-type attack as long as it remains active and has this Ability. If this Pokemon is frozen, it cannot be defrosted by Fire-type attacks.',
		'shortDesc': 'This Pokemon\'s Fire attacks do 1.5x damage if hit by one Fire move; Fire immunity.',
		'id': 'flashfire',
		'name': 'Flash Fire',
		'num': 18
	},
	'flowergift': {
		'desc': 'If this Pokemon is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5.',
		'shortDesc': 'If user is Cherrim and Sunny Day is active, it and allies\' Attack and Sp. Def are 1.5x.',
		'id': 'flowergift',
		'name': 'Flower Gift',
		'num': 122
	},
	'flowerveil': {
		'desc': 'Grass-type Pokemon on this Pokemon\'s side cannot have their stat stages lowered by other Pokemon or have a major status condition inflicted on them by other Pokemon.',
		'shortDesc': 'This side\'s Grass types can\'t have stats lowered or status inflicted by other Pokemon.',
		'id': 'flowerveil',
		'name': 'Flower Veil',
		'num': 166
	},
	'fluffy': {
		'desc': 'This Pokemon receives 1/2 damage from contact moves, but double damage from Fire moves.',
		'shortDesc': 'This Pokemon takes 1/2 damage from contact moves, 2x damage from Fire moves.',
		'id': 'fluffy',
		'name': 'Fluffy',
		'num': 218
	},
	'forecast': {
		'desc': 'If this Pokemon is a Castform, its type changes to the current weather condition\'s type, except Sandstorm.',
		'shortDesc': 'Castform\'s type changes to the current weather condition\'s type, except Sandstorm.',
		'id': 'forecast',
		'name': 'Forecast',
		'num': 59
	},
	'forewarn': {
		'desc': 'On switch-in, this Pokemon is alerted to the move with the highest power, at random, known by an opposing Pokemon.',
		'shortDesc': 'On switch-in, this Pokemon is alerted to the foes\' move with the highest power.',
		'id': 'forewarn',
		'name': 'Forewarn',
		'num': 108
	},
	'friendguard': {
		'shortDesc': 'This Pokemon\'s allies receive 3/4 damage from other Pokemon\'s attacks.',
		'id': 'friendguard',
		'name': 'Friend Guard',
		'num': 132
	},
	'frisk': {
		'shortDesc': 'On switch-in, this Pokemon identifies the held items of all opposing Pokemon.',
		'id': 'frisk',
		'name': 'Frisk',
		'num': 119
	},
	'fullmetalbody': {
		'shortDesc': 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
		'id': 'fullmetalbody',
		'name': 'Full Metal Body',
		'num': 230
	},
	'furcoat': {
		'shortDesc': 'This Pokemon\'s Defense is doubled.',
		'id': 'furcoat',
		'name': 'Fur Coat',
		'num': 169
	},
	'galewings': {
		'shortDesc': 'If this Pokemon is at full HP, its Flying-type moves have their priority increased by 1.',
		'id': 'galewings',
		'name': 'Gale Wings',
		'num': 177
	},
	'galvanize': {
		'desc': 'This Pokemon\'s Normal-type moves become Electric-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
		'shortDesc': 'This Pokemon\'s Normal-type moves become Electric type and have 1.2x power.',
		'id': 'galvanize',
		'name': 'Galvanize',
		'num': 206
	},
	'gluttony': {
		'shortDesc': 'When this Pokemon has 1/2 or less of its maximum HP, it uses certain Berries early.',
		'id': 'gluttony',
		'name': 'Gluttony',
		'num': 82
	},
	'gooey': {
		'shortDesc': 'Pokemon making contact with this Pokemon have their Speed lowered by 1 stage.',
		'id': 'gooey',
		'name': 'Gooey',
		'num': 183
	},
	'grasspelt': {
		'shortDesc': 'If Grassy Terrain is active, this Pokemon\'s Defense is multiplied by 1.5.',
		'id': 'grasspelt',
		'name': 'Grass Pelt',
		'num': 179
	},
	'grassysurge': {
		'shortDesc': 'On switch-in, this Pokemon summons Grassy Terrain.',
		'id': 'grassysurge',
		'name': 'Grassy Surge',
		'num': 229
	},
	'guts': {
		'desc': 'If this Pokemon has a major status condition, its Attack is multiplied by 1.5; burn\'s physical damage halving is ignored.',
		'shortDesc': 'If this Pokemon is statused, its Attack is 1.5x; ignores burn halving physical damage.',
		'id': 'guts',
		'name': 'Guts',
		'num': 62
	},
	'harvest': {
		'desc': 'If the last item this Pokemon used is a Berry, there is a 50% chance it gets restored at the end of each turn. If Sunny Day is active, this chance is 100%.',
		'shortDesc': 'If last item used is a Berry, 50% chance to restore it each end of turn. 100% in Sun.',
		'id': 'harvest',
		'name': 'Harvest',
		'num': 139
	},
	'healer': {
		'desc': 'There is a 30% chance of curing an adjacent ally\'s major status condition at the end of each turn.',
		'shortDesc': '30% chance of curing an adjacent ally\'s status at the end of each turn.',
		'id': 'healer',
		'name': 'Healer',
		'num': 131
	},
	'heatproof': {
		'desc': 'The power of Fire-type attacks against this Pokemon is halved, and burn damage taken is halved.',
		'shortDesc': 'The power of Fire-type attacks against this Pokemon is halved; burn damage halved.',
		'id': 'heatproof',
		'name': 'Heatproof',
		'num': 85
	},
	'heavymetal': {
		'shortDesc': 'This Pokemon\'s weight is doubled.',
		'id': 'heavymetal',
		'name': 'Heavy Metal',
		'num': 134
	},
	'honeygather': {
		'shortDesc': 'No competitive use.',
		'id': 'honeygather',
		'name': 'Honey Gather',
		'num': 118
	},
	'hugepower': {
		'shortDesc': 'This Pokemon\'s Attack is doubled.',
		'id': 'hugepower',
		'name': 'Huge Power',
		'num': 37
	},
	'hustle': {
		'desc': 'This Pokemon\'s Attack is multiplied by 1.5 and the accuracy of its physical attacks is multiplied by 0.8.',
		'shortDesc': 'This Pokemon\'s Attack is 1.5x and accuracy of its physical attacks is 0.8x.',
		'id': 'hustle',
		'name': 'Hustle',
		'num': 55
	},
	'hydration': {
		'desc': 'This Pokemon has its major status condition cured at the end of each turn if Rain Dance is active.',
		'shortDesc': 'This Pokemon has its status cured at the end of each turn if Rain Dance is active.',
		'id': 'hydration',
		'name': 'Hydration',
		'num': 93
	},
	'hypercutter': {
		'shortDesc': 'Prevents other Pokemon from lowering this Pokemon\'s Attack stat stage.',
		'id': 'hypercutter',
		'name': 'Hyper Cutter',
		'num': 52
	},
	'icebody': {
		'desc': 'If Hail is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from Hail.',
		'shortDesc': 'If Hail is active, this Pokemon heals 1/16 of its max HP each turn; immunity to Hail.',
		'id': 'icebody',
		'name': 'Ice Body',
		'num': 115
	},
	'illuminate': {
		'shortDesc': 'No competitive use.',
		'id': 'illuminate',
		'name': 'Illuminate',
		'num': 35
	},
	'illusion': {
		'desc': 'When this Pokemon switches in, it appears as the last unfainted Pokemon in its party until it takes direct damage from another Pokemon\'s attack. This Pokemon\'s actual level and HP are displayed instead of those of the mimicked Pokemon.',
		'shortDesc': 'This Pokemon appears as the last Pokemon in the party until it takes direct damage.',
		'id': 'illusion',
		'name': 'Illusion',
		'num': 149
	},
	'immunity': {
		'shortDesc': 'This Pokemon cannot be poisoned. Gaining this Ability while poisoned cures it.',
		'id': 'immunity',
		'name': 'Immunity',
		'num': 17
	},
	'imposter': {
		'desc': 'On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it. If there is no Pokemon at that position, this Pokemon does not Transform.',
		'shortDesc': 'On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it.',
		'id': 'imposter',
		'name': 'Imposter',
		'num': 150
	},
	'infiltrator': {
		'desc': 'This Pokemon\'s moves ignore substitutes and the opposing side\'s Reflect, Light Screen, Safeguard, and Mist.',
		'shortDesc': 'Moves ignore substitutes and opposing Reflect, Light Screen, Safeguard, and Mist.',
		'id': 'infiltrator',
		'name': 'Infiltrator',
		'num': 151
	},
	'innardsout': {
		'desc': 'If this Pokemon is knocked out with a move, that move\'s user loses HP equal to the amount of damage inflicted on this Pokemon.',
		'shortDesc': 'If this Pokemon is KOed with a move, that move\'s user loses an equal amount of HP.',
		'id': 'innardsout',
		'name': 'Innards Out',
		'num': 215
	},
	'innerfocus': {
		'shortDesc': 'This Pokemon cannot be made to flinch.',
		'id': 'innerfocus',
		'name': 'Inner Focus',
		'num': 39
	},
	'insomnia': {
		'shortDesc': 'This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.',
		'id': 'insomnia',
		'name': 'Insomnia',
		'num': 15
	},
	'intimidate': {
		'desc': 'On switch-in, this Pokemon lowers the Attack of adjacent opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.',
		'shortDesc': 'On switch-in, this Pokemon lowers the Attack of adjacent opponents by 1 stage.',
		'id': 'intimidate',
		'name': 'Intimidate',
		'num': 22
	},
	'ironbarbs': {
		'desc': 'Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.',
		'shortDesc': 'Pokemon making contact with this Pokemon lose 1/8 of their max HP.',
		'id': 'ironbarbs',
		'name': 'Iron Barbs',
		'num': 160
	},
	'ironfist': {
		'desc': 'This Pokemon\'s punch-based attacks have their power multiplied by 1.2.',
		'shortDesc': 'This Pokemon\'s punch-based attacks have 1.2x power. Sucker Punch is not boosted.',
		'id': 'ironfist',
		'name': 'Iron Fist',
		'num': 89
	},
	'justified': {
		'shortDesc': 'This Pokemon\'s Attack is raised by 1 stage after it is damaged by a Dark-type move.',
		'id': 'justified',
		'name': 'Justified',
		'num': 154
	},
	'keeneye': {
		'desc': 'Prevents other Pokemon from lowering this Pokemon\'s accuracy stat stage. This Pokemon ignores a target\'s evasiveness stat stage.',
		'shortDesc': 'This Pokemon\'s accuracy can\'t be lowered by others; ignores their evasiveness stat.',
		'id': 'keeneye',
		'name': 'Keen Eye',
		'num': 51
	},
	'klutz': {
		'desc': 'This Pokemon\'s held item has no effect. This Pokemon cannot use Fling successfully. Macho Brace, Power Anklet, Power Band, Power Belt, Power Bracer, Power Lens, and Power Weight still have their effects.',
		'shortDesc': 'This Pokemon\'s held item has no effect, except Macho Brace. Fling cannot be used.',
		'id': 'klutz',
		'name': 'Klutz',
		'num': 103
	},
	'leafguard': {
		'desc': 'If Sunny Day is active, this Pokemon cannot gain a major status condition and Rest will fail for it.',
		'shortDesc': 'If Sunny Day is active, this Pokemon cannot be statused and Rest will fail for it.',
		'id': 'leafguard',
		'name': 'Leaf Guard',
		'num': 102
	},
	'levitate': {
		'desc': 'This Pokemon is immune to Ground. Gravity, Ingrain, Smack Down, Thousand Arrows, and Iron Ball nullify the immunity.',
		'shortDesc': 'This Pokemon is immune to Ground; Gravity/Ingrain/Smack Down/Iron Ball nullify it.',
		'id': 'levitate',
		'name': 'Levitate',
		'num': 26
	},
	'lightmetal': {
		'shortDesc': 'This Pokemon\'s weight is halved.',
		'id': 'lightmetal',
		'name': 'Light Metal',
		'num': 135
	},
	'lightningrod': {
		'desc': 'This Pokemon is immune to Electric-type moves and raises its Special Attack by 1 stage when hit by an Electric-type move. If this Pokemon is not the target of a single-target Electric-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move.',
		'shortDesc': 'This Pokemon draws Electric moves to itself to raise Sp. Atk by 1; Electric immunity.',
		'id': 'lightningrod',
		'name': 'Lightning Rod',
		'num': 32
	},
	'limber': {
		'shortDesc': 'This Pokemon cannot be paralyzed. Gaining this Ability while paralyzed cures it.',
		'id': 'limber',
		'name': 'Limber',
		'num': 7
	},
	'liquidooze': {
		'shortDesc': 'This Pokemon damages those draining HP from it for as much as they would heal.',
		'id': 'liquidooze',
		'name': 'Liquid Ooze',
		'num': 64
	},
	'liquidvoice': {
		'desc': 'This Pokemon\'s sound-based moves become Water-type moves. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
		'shortDesc': 'This Pokemon\'s sound-based moves become Water type.',
		'id': 'liquidvoice',
		'name': 'Liquid Voice',
		'num': 204
	},
	'longreach': {
		'shortDesc': 'This Pokemon\'s attacks do not make contact with the target.',
		'id': 'longreach',
		'name': 'Long Reach',
		'num': 203
	},
	'magicbounce': {
		'desc': 'This Pokemon blocks certain status moves and instead uses the move against the original user.',
		'shortDesc': 'This Pokemon blocks certain status moves and bounces them back to the user.',
		'id': 'magicbounce',
		'name': 'Magic Bounce',
		'num': 156
	},
	'magicguard': {
		'desc': 'This Pokemon can only be damaged by direct attacks. Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage are considered direct damage.',
		'shortDesc': 'This Pokemon can only be damaged by direct attacks.',
		'id': 'magicguard',
		'name': 'Magic Guard',
		'num': 98
	},
	'magician': {
		'desc': 'If this Pokemon has no item, it steals the item off a Pokemon it hits with an attack. Does not affect Doom Desire and Future Sight.',
		'shortDesc': 'If this Pokemon has no item, it steals the item off a Pokemon it hits with an attack.',
		'id': 'magician',
		'name': 'Magician',
		'num': 170
	},
	'magmaarmor': {
		'shortDesc': 'This Pokemon cannot be frozen. Gaining this Ability while frozen cures it.',
		'id': 'magmaarmor',
		'name': 'Magma Armor',
		'num': 40
	},
	'magnetpull': {
		'desc': 'Prevents adjacent opposing Steel-type Pokemon from choosing to switch out unless they are immune to trapping.',
		'shortDesc': 'Prevents adjacent Steel-type foes from choosing to switch.',
		'id': 'magnetpull',
		'name': 'Magnet Pull',
		'num': 42
	},
	'marvelscale': {
		'desc': 'If this Pokemon has a major status condition, its Defense is multiplied by 1.5.',
		'shortDesc': 'If this Pokemon is statused, its Defense is 1.5x.',
		'id': 'marvelscale',
		'name': 'Marvel Scale',
		'num': 63
	},
	'megalauncher': {
		'desc': 'This Pokemon\'s pulse moves have their power multiplied by 1.5. Heal Pulse restores 3/4 of a target\'s maximum HP, rounded half down.',
		'shortDesc': 'This Pokemon\'s pulse moves have 1.5x power. Heal Pulse heals 3/4 target\'s max HP.',
		'id': 'megalauncher',
		'name': 'Mega Launcher',
		'num': 178
	},
	'merciless': {
		'shortDesc': 'This Pokemon\'s attacks are critical hits if the target is poisoned.',
		'id': 'merciless',
		'name': 'Merciless',
		'num': 196
	},
	'minus': {
		'desc': 'If an active ally has this Ability or the Ability Plus, this Pokemon\'s Special Attack is multiplied by 1.5.',
		'shortDesc': 'If an active ally has this Ability or the Ability Plus, this Pokemon\'s Sp. Atk is 1.5x.',
		'id': 'minus',
		'name': 'Minus',
		'num': 58
	},
	'mistysurge': {
		'shortDesc': 'On switch-in, this Pokemon summons Misty Terrain.',
		'id': 'mistysurge',
		'name': 'Misty Surge',
		'num': 228
	},
	'moldbreaker': {
		'shortDesc': 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
		'id': 'moldbreaker',
		'name': 'Mold Breaker',
		'num': 104
	},
	'moody': {
		'desc': 'This Pokemon has a random stat raised by 2 stages and another stat lowered by 1 stage at the end of each turn.',
		'shortDesc': 'Raises a random stat by 2 and lowers another stat by 1 at the end of each turn.',
		'id': 'moody',
		'name': 'Moody',
		'num': 141
	},
	'motordrive': {
		'desc': 'This Pokemon is immune to Electric-type moves and raises its Speed by 1 stage when hit by an Electric-type move.',
		'shortDesc': 'This Pokemon\'s Speed is raised 1 stage if hit by an Electric move; Electric immunity.',
		'id': 'motordrive',
		'name': 'Motor Drive',
		'num': 78
	},
	'moxie': {
		'desc': 'This Pokemon\'s Attack is raised by 1 stage if it attacks and knocks out another Pokemon.',
		'shortDesc': 'This Pokemon\'s Attack is raised by 1 stage if it attacks and KOes another Pokemon.',
		'id': 'moxie',
		'name': 'Moxie',
		'num': 153
	},
	'multiscale': {
		'shortDesc': 'If this Pokemon is at full HP, damage taken from attacks is halved.',
		'id': 'multiscale',
		'name': 'Multiscale',
		'num': 136
	},
	'multitype': {
		'shortDesc': 'If this Pokemon is an Arceus, its type changes to match its held Plate or Z-Crystal.',
		'id': 'multitype',
		'name': 'Multitype',
		'num': 121
	},
	'mummy': {
		'desc': 'Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect the Abilities Multitype or Stance Change.',
		'shortDesc': 'Pokemon making contact with this Pokemon have their Ability changed to Mummy.',
		'id': 'mummy',
		'name': 'Mummy',
		'num': 152
	},
	'naturalcure': {
		'shortDesc': 'This Pokemon has its major status condition cured when it switches out.',
		'id': 'naturalcure',
		'name': 'Natural Cure',
		'num': 30
	},
	'noguard': {
		'shortDesc': 'Every move used by or against this Pokemon will always hit.',
		'id': 'noguard',
		'name': 'No Guard',
		'num': 99
	},
	'normalize': {
		'desc': 'This Pokemon\'s moves are changed to be Normal type and have their power multiplied by 1.2. This effect comes before other effects that change a move\'s type.',
		'shortDesc': 'This Pokemon\'s moves are changed to be Normal type and have 1.2x power.',
		'id': 'normalize',
		'name': 'Normalize',
		'num': 96
	},
	'oblivious': {
		'desc': 'This Pokemon cannot be infatuated or taunted. Gaining this Ability while affected cures it.',
		'shortDesc': 'This Pokemon cannot be infatuated or taunted. Gaining this Ability cures it.',
		'id': 'oblivious',
		'name': 'Oblivious',
		'num': 12
	},
	'overcoat': {
		'shortDesc': 'This Pokemon is immune to powder moves and damage from Sandstorm or Hail.',
		'id': 'overcoat',
		'name': 'Overcoat',
		'num': 142
	},
	'overgrow': {
		'desc': 'When this Pokemon has 1/3 or less of its maximum HP, its attacking stat is multiplied by 1.5 while using a Grass-type attack.',
		'shortDesc': 'When this Pokemon has 1/3 or less of its max HP, its Grass attacks do 1.5x damage.',
		'id': 'overgrow',
		'name': 'Overgrow',
		'num': 65
	},
	'owntempo': {
		'shortDesc': 'This Pokemon cannot be confused. Gaining this Ability while confused cures it.',
		'id': 'owntempo',
		'name': 'Own Tempo',
		'num': 20
	},
	'parentalbond': {
		'desc': 'This Pokemon\'s damaging moves become multi-hit moves that hit twice. The second hit has its damage quartered. Does not affect multi-hit moves or moves that have multiple targets.',
		'shortDesc': 'This Pokemon\'s damaging moves hit twice. The second hit has its damage quartered.',
		'id': 'parentalbond',
		'name': 'Parental Bond',
		'num': 184
	},
	'pickup': {
		'shortDesc': 'If this Pokemon has no item, it finds one used by an adjacent Pokemon this turn.',
		'id': 'pickup',
		'name': 'Pickup',
		'num': 53
	},
	'pickpocket': {
		'desc': 'If this Pokemon has no item, it steals the item off a Pokemon that makes contact with it. This effect applies after all hits from a multi-hit move; Sheer Force prevents it from activating if the move has a secondary effect.',
		'shortDesc': 'If this Pokemon has no item, it steals the item off a Pokemon making contact with it.',
		'id': 'pickpocket',
		'name': 'Pickpocket',
		'num': 124
	},
	'pixilate': {
		'desc': 'This Pokemon\'s Normal-type moves become Fairy-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
		'shortDesc': 'This Pokemon\'s Normal-type moves become Fairy type and have 1.2x power.',
		'id': 'pixilate',
		'name': 'Pixilate',
		'num': 182
	},
	'plus': {
		'desc': 'If an active ally has this Ability or the Ability Minus, this Pokemon\'s Special Attack is multiplied by 1.5.',
		'shortDesc': 'If an active ally has this Ability or the Ability Minus, this Pokemon\'s Sp. Atk is 1.5x.',
		'id': 'plus',
		'name': 'Plus',
		'num': 57
	},
	'poisonheal': {
		'desc': 'If this Pokemon is poisoned, it restores 1/8 of its maximum HP, rounded down, at the end of each turn instead of losing HP.',
		'shortDesc': 'This Pokemon is healed by 1/8 of its max HP each turn when poisoned; no HP loss.',
		'id': 'poisonheal',
		'name': 'Poison Heal',
		'num': 90
	},
	'poisonpoint': {
		'shortDesc': '30% chance a Pokemon making contact with this Pokemon will be poisoned.',
		'id': 'poisonpoint',
		'name': 'Poison Point',
		'num': 38
	},
	'poisontouch': {
		'shortDesc': 'This Pokemon\'s contact moves have a 30% chance of poisoning.',
		'id': 'poisontouch',
		'name': 'Poison Touch',
		'num': 143
	},
	'powerconstruct': {
		'desc': 'If this Pokemon is a Zygarde in its 10% or 50% Forme, it changes to Complete Forme when it has 1/2 or less of its maximum HP at the end of the turn.',
		'shortDesc': 'If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn.',
		'id': 'powerconstruct',
		'name': 'Power Construct',
		'num': 211
	},
	'powerofalchemy': {
		'desc': 'This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, Wonder Guard, and Zen Mode.',
		'shortDesc': 'This Pokemon copies the Ability of an ally that faints.',
		'id': 'powerofalchemy',
		'name': 'Power of Alchemy',
		'num': 223
	},
	'prankster': {
		'shortDesc': 'This Pokemon\'s Status moves have priority raised by 1, but Dark types are immune.',
		'id': 'prankster',
		'name': 'Prankster',
		'num': 158
	},
	'pressure': {
		'desc': 'If this Pokemon is the target of an opposing Pokemon\'s move, that move loses one additional PP.',
		'shortDesc': 'If this Pokemon is the target of a foe\'s move, that move loses one additional PP.',
		'id': 'pressure',
		'name': 'Pressure',
		'num': 46
	},
	'primordialsea': {
		'desc': 'On switch-in, the weather becomes heavy rain that prevents damaging Fire-type moves from executing, in addition to all the effects of Rain Dance. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by Delta Stream or Desolate Land.',
		'shortDesc': 'On switch-in, heavy rain begins until this Ability is not active in battle.',
		'id': 'primordialsea',
		'name': 'Primordial Sea',
		'num': 189
	},
	'prismarmor': {
		'shortDesc': 'This Pokemon receives 3/4 damage from supereffective attacks.',
		'isUnbreakable': true,
		'id': 'prismarmor',
		'name': 'Prism Armor',
		'num': 232
	},
	'protean': {
		'desc': 'This Pokemon\'s type changes to match the type of the move it is about to use. This effect comes after all effects that change a move\'s type.',
		'shortDesc': 'This Pokemon\'s type changes to match the type of the move it is about to use.',
		'id': 'protean',
		'name': 'Protean',
		'num': 168
	},
	'psychicsurge': {
		'shortDesc': 'On switch-in, this Pokemon summons Psychic Terrain.',
		'id': 'psychicsurge',
		'name': 'Psychic Surge',
		'num': 227
	},
	'purepower': {
		'shortDesc': 'This Pokemon\'s Attack is doubled.',
		'id': 'purepower',
		'name': 'Pure Power',
		'num': 74
	},
	'queenlymajesty': {
		'desc': 'While this Pokemon is active, priority moves from opposing Pokemon targeted at allies are prevented from having an effect.',
		'shortDesc': 'While this Pokemon is active, allies are protected from opposing priority moves.',
		'id': 'queenlymajesty',
		'name': 'Queenly Majesty',
		'num': 214
	},
	'quickfeet': {
		'desc': 'If this Pokemon has a major status condition, its Speed is multiplied by 1.5; the Speed drop from paralysis is ignored.',
		'shortDesc': 'If this Pokemon is statused, its Speed is 1.5x; ignores Speed drop from paralysis.',
		'id': 'quickfeet',
		'name': 'Quick Feet',
		'num': 95
	},
	'raindish': {
		'desc': 'If Rain Dance is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn.',
		'shortDesc': 'If Rain Dance is active, this Pokemon heals 1/16 of its max HP each turn.',
		'id': 'raindish',
		'name': 'Rain Dish',
		'num': 44
	},
	'rattled': {
		'desc': 'This Pokemon\'s Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.',
		'shortDesc': 'This Pokemon\'s Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.',
		'id': 'rattled',
		'name': 'Rattled',
		'num': 155
	},
	'receiver': {
		'desc': 'This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, Wonder Guard, and Zen Mode.',
		'shortDesc': 'This Pokemon copies the Ability of an ally that faints.',
		'id': 'receiver',
		'name': 'Receiver',
		'num': 222
	},
	'reckless': {
		'desc': 'This Pokemon\'s attacks with recoil or crash damage have their power multiplied by 1.2. Does not affect Struggle.',
		'shortDesc': 'This Pokemon\'s attacks with recoil or crash damage have 1.2x power; not Struggle.',
		'id': 'reckless',
		'name': 'Reckless',
		'num': 120
	},
	'refrigerate': {
		'desc': 'This Pokemon\'s Normal-type moves become Ice-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move\'s type, but before Ion Deluge and Electrify\'s effects.',
		'shortDesc': 'This Pokemon\'s Normal-type moves become Ice type and have 1.2x power.',
		'id': 'refrigerate',
		'name': 'Refrigerate',
		'num': 174
	},
	'regenerator': {
		'shortDesc': 'This Pokemon restores 1/3 of its maximum HP, rounded down, when it switches out.',
		'id': 'regenerator',
		'name': 'Regenerator',
		'num': 144
	},
	'rivalry': {
		'desc': 'This Pokemon\'s attacks have their power multiplied by 1.25 against targets of the same gender or multiplied by 0.75 against targets of the opposite gender. There is no modifier if either this Pokemon or the target is genderless.',
		'shortDesc': 'This Pokemon\'s attacks do 1.25x on same gender targets; 0.75x on opposite gender.',
		'id': 'rivalry',
		'name': 'Rivalry',
		'num': 79
	},
	'rkssystem': {
		'shortDesc': 'If this Pokemon is a Silvally, its type changes to match its held Memory.',
		'id': 'rkssystem',
		'name': 'RKS System',
		'num': 225
	},
	'rockhead': {
		'desc': 'This Pokemon does not take recoil damage besides Struggle, Life Orb, and crash damage.',
		'shortDesc': 'This Pokemon does not take recoil damage besides Struggle/Life Orb/crash damage.',
		'id': 'rockhead',
		'name': 'Rock Head',
		'num': 69
	},
	'roughskin': {
		'desc': 'Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.',
		'shortDesc': 'Pokemon making contact with this Pokemon lose 1/8 of their max HP.',
		'id': 'roughskin',
		'name': 'Rough Skin',
		'num': 24
	},
	'runaway': {
		'shortDesc': 'No competitive use.',
		'id': 'runaway',
		'name': 'Run Away',
		'num': 50
	},
	'sandforce': {
		'desc': 'If Sandstorm is active, this Pokemon\'s Ground-, Rock-, and Steel-type attacks have their power multiplied by 1.3. This Pokemon takes no damage from Sandstorm.',
		'shortDesc': 'This Pokemon\'s Ground/Rock/Steel attacks do 1.3x in Sandstorm; immunity to it.',
		'id': 'sandforce',
		'name': 'Sand Force',
		'num': 159
	},
	'sandrush': {
		'desc': 'If Sandstorm is active, this Pokemon\'s Speed is doubled. This Pokemon takes no damage from Sandstorm.',
		'shortDesc': 'If Sandstorm is active, this Pokemon\'s Speed is doubled; immunity to Sandstorm.',
		'id': 'sandrush',
		'name': 'Sand Rush',
		'num': 146
	},
	'sandstream': {
		'shortDesc': 'On switch-in, this Pokemon summons Sandstorm.',
		'id': 'sandstream',
		'name': 'Sand Stream',
		'num': 45
	},
	'sandveil': {
		'desc': 'If Sandstorm is active, this Pokemon\'s evasiveness is multiplied by 1.25. This Pokemon takes no damage from Sandstorm.',
		'shortDesc': 'If Sandstorm is active, this Pokemon\'s evasiveness is 1.25x; immunity to Sandstorm.',
		'id': 'sandveil',
		'name': 'Sand Veil',
		'num': 8
	},
	'sapsipper': {
		'desc': 'This Pokemon is immune to Grass-type moves and raises its Attack by 1 stage when hit by a Grass-type move.',
		'shortDesc': 'This Pokemon\'s Attack is raised 1 stage if hit by a Grass move; Grass immunity.',
		'id': 'sapsipper',
		'name': 'Sap Sipper',
		'num': 157
	},
	'schooling': {
		'desc': 'On switch-in, if this Pokemon is a Wishiwashi that is level 20 or above and has more than 1/4 of its maximum HP left, it changes to School Form. If it is in School Form and its HP drops to 1/4 of its maximum HP or less, it changes to Solo Form at the end of the turn. If it is in Solo Form and its HP is greater than 1/4 its maximum HP at the end of the turn, it changes to School Form.',
		'shortDesc': 'If user is Wishiwashi, changes to School Form if it has > 1/4 max HP, else Solo Form.',
		'id': 'schooling',
		'name': 'Schooling',
		'num': 208
	},
	'scrappy': {
		'shortDesc': 'This Pokemon can hit Ghost types with Normal- and Fighting-type moves.',
		'id': 'scrappy',
		'name': 'Scrappy',
		'num': 113
	},
	'serenegrace': {
		'shortDesc': 'This Pokemon\'s moves have their secondary effect chance doubled.',
		'id': 'serenegrace',
		'name': 'Serene Grace',
		'num': 32
	},
	'shadowshield': {
		'shortDesc': 'If this Pokemon is at full HP, damage taken from attacks is halved.',
		'isUnbreakable': true,
		'id': 'shadowshield',
		'name': 'Shadow Shield',
		'num': 231
	},
	'shadowtag': {
		'desc': 'Prevents adjacent opposing Pokemon from choosing to switch out unless they are immune to trapping or also have this Ability.',
		'shortDesc': 'Prevents adjacent foes from choosing to switch unless they also have this Ability.',
		'id': 'shadowtag',
		'name': 'Shadow Tag',
		'num': 23
	},
	'shedskin': {
		'desc': 'This Pokemon has a 33% chance to have its major status condition cured at the end of each turn.',
		'shortDesc': 'This Pokemon has a 33% chance to have its status cured at the end of each turn.',
		'id': 'shedskin',
		'name': 'Shed Skin',
		'num': 61
	},
	'sheerforce': {
		'desc': 'This Pokemon\'s attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed.',
		'shortDesc': 'This Pokemon\'s attacks with secondary effects have 1.3x power; nullifies the effects.',
		'id': 'sheerforce',
		'name': 'Sheer Force',
		'num': 125
	},
	'shellarmor': {
		'shortDesc': 'This Pokemon cannot be struck by a critical hit.',
		'id': 'shellarmor',
		'name': 'Shell Armor',
		'num': 75
	},
	'shielddust': {
		'shortDesc': 'This Pokemon is not affected by the secondary effect of another Pokemon\'s attack.',
		'id': 'shielddust',
		'name': 'Shield Dust',
		'num': 19
	},
	'shieldsdown': {
		'desc': 'If this Pokemon is a Minior, it changes to its Core forme if it has 1/2 or less of its maximum HP, and changes to Meteor Form if it has more than 1/2 its maximum HP. This check is done on switch-in and at the end of each turn. While in its Meteor Form, it cannot become affected by major status conditions.',
		'shortDesc': 'If Minior, switch-in/end of turn it changes to Core at 1/2 max HP or less, else Meteor.',
		'id': 'shieldsdown',
		'name': 'Shields Down',
		'num': 197
	},
	'simple': {
		'shortDesc': 'If this Pokemon\'s stat stages are raised or lowered, the effect is doubled instead.',
		'id': 'simple',
		'name': 'Simple',
		'num': 86
	},
	'skilllink': {
		'shortDesc': 'This Pokemon\'s multi-hit attacks always hit the maximum number of times.',
		'id': 'skilllink',
		'name': 'Skill Link',
		'num': 92
	},
	'slowstart': {
		'shortDesc': 'On switch-in, this Pokemon\'s Attack and Speed are halved for 5 turns.',
		'id': 'slowstart',
		'name': 'Slow Start',
		'num': 112
	},
	'slushrush': {
		'desc': 'If Hail is active, this Pokemon\'s Speed is doubled. This Pokemon takes no damage from Hail.',
		'shortDesc': 'If Hail is active, this Pokemon\'s Speed is doubled; immunity to Hail.',
		'id': 'slushrush',
		'name': 'Slush Rush',
		'num': 202
	},
	'sniper': {
		'shortDesc': 'If this Pokemon strikes with a critical hit, the damage is multiplied by 1.5.',
		'id': 'sniper',
		'name': 'Sniper',
		'num': 97
	},
	'snowcloak': {
		'desc': 'If Hail is active, this Pokemon\'s evasiveness is multiplied by 1.25. This Pokemon takes no damage from Hail.',
		'shortDesc': 'If Hail is active, this Pokemon\'s evasiveness is 1.25x; immunity to Hail.',
		'id': 'snowcloak',
		'name': 'Snow Cloak',
		'num': 81
	},
	'snowwarning': {
		'shortDesc': 'On switch-in, this Pokemon summons Hail.',
		'id': 'snowwarning',
		'name': 'Snow Warning',
		'num': 117
	},
	'solarpower': {
		'desc': 'If Sunny Day is active, this Pokemon\'s Special Attack is multiplied by 1.5 and it loses 1/8 of its maximum HP, rounded down, at the end of each turn.',
		'shortDesc': 'If Sunny Day is active, this Pokemon\'s Sp. Atk is 1.5x; loses 1/8 max HP per turn.',
		'id': 'solarpower',
		'name': 'Solar Power',
		'num': 94
	},
	'solidrock': {
		'shortDesc': 'This Pokemon receives 3/4 damage from supereffective attacks.',
		'id': 'solidrock',
		'name': 'Solid Rock',
		'num': 116
	},
	'soulheart': {
		'desc': 'This Pokemon\'s Special Attack is raised by 1 stage when another Pokemon faints.',
		'shortDesc': 'This Pokemon\'s Sp. Atk is raised by 1 stage when another Pokemon faints.',
		'id': 'soulheart',
		'name': 'Soul-Heart',
		'num': 220
	},
	'soundproof': {
		'shortDesc': 'This Pokemon is immune to sound-based moves, including Heal Bell.',
		'id': 'soundproof',
		'name': 'Soundproof',
		'num': 43
	},
	'speedboost': {
		'desc': 'This Pokemon\'s Speed is raised by 1 stage at the end of each full turn it has been on the field.',
		'shortDesc': 'This Pokemon\'s Speed is raised 1 stage at the end of each full turn on the field.',
		'id': 'speedboost',
		'name': 'Speed Boost',
		'num': 3
	},
	'stakeout': {
		'shortDesc': 'This Pokemon\'s attacks deal double damage if the target switched in this turn.',
		'id': 'stakeout',
		'name': 'Stakeout',
		'num': 198
	},
	'stall': {
		'shortDesc': 'This Pokemon moves last among Pokemon using the same or greater priority moves.',
		'id': 'stall',
		'name': 'Stall',
		'num': 100
	},
	'stamina': {
		'shortDesc': 'This Pokemon\'s Defense is raised by 1 stage after it is damaged by a move.',
		'id': 'stamina',
		'name': 'Stamina',
		'num': 192
	},
	'stancechange': {
		'desc': 'If this Pokemon is an Aegislash, it changes to Blade Forme before attempting to use an attacking move, and changes to Shield Forme before attempting to use King\'s Shield.',
		'shortDesc': 'If Aegislash, changes Forme to Blade before attacks and Shield before King\'s Shield.',
		'id': 'stancechange',
		'name': 'Stance Change',
		'num': 176
	},
	'static': {
		'shortDesc': '30% chance a Pokemon making contact with this Pokemon will be paralyzed.',
		'id': 'static',
		'name': 'Static',
		'num': 9
	},
	'steadfast': {
		'shortDesc': 'If this Pokemon flinches, its Speed is raised by 1 stage.',
		'id': 'steadfast',
		'name': 'Steadfast',
		'num': 80
	},
	'steelworker': {
		'shortDesc': 'This Pokemon\'s Steel-type attacks have their power multiplied by 1.5.',
		'id': 'steelworker',
		'name': 'Steelworker',
		'num': 200
	},
	'stench': {
		'shortDesc': 'This Pokemon\'s attacks without a chance to flinch have a 10% chance to flinch.',
		'id': 'stench',
		'name': 'Stench',
		'num': 1
	},
	'stickyhold': {
		'shortDesc': 'This Pokemon cannot lose its held item due to another Pokemon\'s attack.',
		'id': 'stickyhold',
		'name': 'Sticky Hold',
		'num': 60
	},
	'stormdrain': {
		'desc': 'This Pokemon is immune to Water-type moves and raises its Special Attack by 1 stage when hit by a Water-type move. If this Pokemon is not the target of a single-target Water-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move.',
		'shortDesc': 'This Pokemon draws Water moves to itself to raise Sp. Atk by 1; Water immunity.',
		'id': 'stormdrain',
		'name': 'Storm Drain',
		'num': 114
	},
	'strongjaw': {
		'desc': 'This Pokemon\'s bite-based attacks have their power multiplied by 1.5.',
		'shortDesc': 'This Pokemon\'s bite-based attacks have 1.5x power. Bug Bite is not boosted.',
		'id': 'strongjaw',
		'name': 'Strong Jaw',
		'num': 173
	},
	'sturdy': {
		'desc': 'If this Pokemon is at full HP, it survives one hit with at least 1 HP. OHKO moves fail when used against this Pokemon.',
		'shortDesc': 'If this Pokemon is at full HP, it survives one hit with at least 1 HP. Immune to OHKO.',
		'id': 'sturdy',
		'name': 'Sturdy',
		'num': 5
	},
	'suctioncups': {
		'shortDesc': 'This Pokemon cannot be forced to switch out by another Pokemon\'s attack or item.',
		'id': 'suctioncups',
		'name': 'Suction Cups',
		'num': 21
	},
	'superluck': {
		'shortDesc': 'This Pokemon\'s critical hit ratio is raised by 1 stage.',
		'id': 'superluck',
		'name': 'Super Luck',
		'num': 105
	},
	'surgesurfer': {
		'shortDesc': 'If Electric Terrain is active, this Pokemon\'s Speed is doubled.',
		'id': 'surgesurfer',
		'name': 'Surge Surfer',
		'num': 207
	},
	'swarm': {
		'desc': 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Bug-type attack.',
		'shortDesc': 'When this Pokemon has 1/3 or less of its max HP, its Bug attacks do 1.5x damage.',
		'id': 'swarm',
		'name': 'Swarm',
		'num': 68
	},
	'sweetveil': {
		'shortDesc': 'This Pokemon and its allies cannot fall asleep.',
		'id': 'sweetveil',
		'name': 'Sweet Veil',
		'num': 175
	},
	'swiftswim': {
		'shortDesc': 'If Rain Dance is active, this Pokemon\'s Speed is doubled.',
		'id': 'swiftswim',
		'name': 'Swift Swim',
		'num': 33
	},
	'symbiosis': {
		'desc': 'If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally\'s item was stolen or knocked off.',
		'shortDesc': 'If an ally uses its item, this Pokemon gives its item to that ally immediately.',
		'id': 'symbiosis',
		'name': 'Symbiosis',
		'num': 180
	},
	'synchronize': {
		'desc': 'If another Pokemon burns, paralyzes, poisons, or badly poisons this Pokemon, that Pokemon receives the same major status condition.',
		'shortDesc': 'If another Pokemon burns/poisons/paralyzes this Pokemon, it also gets that status.',
		'id': 'synchronize',
		'name': 'Synchronize',
		'num': 28
	},
	'tangledfeet': {
		'shortDesc': 'This Pokemon\'s evasiveness is doubled as long as it is confused.',
		'id': 'tangledfeet',
		'name': 'Tangled Feet',
		'num': 77
	},
	'tanglinghair': {
		'shortDesc': 'Pokemon making contact with this Pokemon have their Speed lowered by 1 stage.',
		'id': 'tanglinghair',
		'name': 'Tangling Hair',
		'num': 221
	},
	'technician': {
		'desc': 'This Pokemon\'s moves of 60 power or less have their power multiplied by 1.5. Does affect Struggle.',
		'shortDesc': 'This Pokemon\'s moves of 60 power or less have 1.5x power. Includes Struggle.',
		'id': 'technician',
		'name': 'Technician',
		'num': 101
	},
	'telepathy': {
		'shortDesc': 'This Pokemon does not take damage from attacks made by its allies.',
		'id': 'telepathy',
		'name': 'Telepathy',
		'num': 140
	},
	'teravolt': {
		'shortDesc': 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
		'id': 'teravolt',
		'name': 'Teravolt',
		'num': 164
	},
	'thickfat': {
		'desc': 'If a Pokemon uses a Fire- or Ice-type attack against this Pokemon, that Pokemon\'s attacking stat is halved when calculating the damage to this Pokemon.',
		'shortDesc': 'Fire/Ice-type moves against this Pokemon deal damage with a halved attacking stat.',
		'id': 'thickfat',
		'name': 'Thick Fat',
		'num': 47
	},
	'tintedlens': {
		'shortDesc': 'This Pokemon\'s attacks that are not very effective on a target deal double damage.',
		'id': 'tintedlens',
		'name': 'Tinted Lens',
		'num': 110
	},
	'torrent': {
		'desc': 'When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Water-type attack.',
		'shortDesc': 'When this Pokemon has 1/3 or less of its max HP, its Water attacks do 1.5x damage.',
		'id': 'torrent',
		'name': 'Torrent',
		'num': 67
	},
	'toxicboost': {
		'desc': 'While this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5.',
		'shortDesc': 'While this Pokemon is poisoned, its physical attacks have 1.5x power.',
		'id': 'toxicboost',
		'name': 'Toxic Boost',
		'num': 137
	},
	'toughclaws': {
		'shortDesc': 'This Pokemon\'s contact moves have their power multiplied by 1.3.',
		'id': 'toughclaws',
		'name': 'Tough Claws',
		'num': 181
	},
	'trace': {
		'desc': 'On switch-in, this Pokemon copies a random adjacent opposing Pokemon\'s Ability. If there is no Ability that can be copied at that time, this Ability will activate as soon as an Ability can be copied. Abilities that cannot be copied are Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Schooling, Stance Change, Trace, and Zen Mode.',
		'shortDesc': 'On switch-in, or when it can, this Pokemon copies a random adjacent foe\'s Ability.',
		'id': 'trace',
		'name': 'Trace',
		'num': 36
	},
	'triage': {
		'shortDesc': 'This Pokemon\'s healing moves have their priority increased by 3.',
		'id': 'triage',
		'name': 'Triage',
		'num': 205
	},
	'truant': {
		'shortDesc': 'This Pokemon skips every other turn instead of using a move.',
		'id': 'truant',
		'name': 'Truant',
		'num': 54
	},
	'turboblaze': {
		'shortDesc': 'This Pokemon\'s moves and their effects ignore the Abilities of other Pokemon.',
		'id': 'turboblaze',
		'name': 'Turboblaze',
		'num': 163
	},
	'unaware': {
		'desc': 'This Pokemon ignores other Pokemon\'s Attack, Special Attack, and accuracy stat stages when taking damage, and ignores other Pokemon\'s Defense, Special Defense, and evasiveness stat stages when dealing damage.',
		'shortDesc': 'This Pokemon ignores other Pokemon\'s stat stages when taking or doing damage.',
		'id': 'unaware',
		'name': 'Unaware',
		'num': 109
	},
	'unburden': {
		'desc': 'If this Pokemon loses its held item for any reason, its Speed is doubled. This boost is lost if it switches out or gains a new item or Ability.',
		'shortDesc': 'Speed is doubled on held item loss; boost is lost if it switches, gets new item/Ability.',
		'id': 'unburden',
		'name': 'Unburden',
		'num': 84
	},
	'unnerve': {
		'shortDesc': 'While this Pokemon is active, it prevents opposing Pokemon from using their Berries.',
		'id': 'unnerve',
		'name': 'Unnerve',
		'num': 127
	},
	'victorystar': {
		'shortDesc': 'This Pokemon and its allies\' moves have their accuracy multiplied by 1.1.',
		'id': 'victorystar',
		'name': 'Victory Star',
		'num': 162
	},
	'vitalspirit': {
		'shortDesc': 'This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.',
		'id': 'vitalspirit',
		'name': 'Vital Spirit',
		'num': 72
	},
	'voltabsorb': {
		'desc': 'This Pokemon is immune to Electric-type moves and restores 1/4 of its maximum HP, rounded down, when hit by an Electric-type move.',
		'shortDesc': 'This Pokemon heals 1/4 of its max HP when hit by Electric moves; Electric immunity.',
		'id': 'voltabsorb',
		'name': 'Volt Absorb',
		'num': 10
	},
	'waterabsorb': {
		'desc': 'This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move.',
		'shortDesc': 'This Pokemon heals 1/4 of its max HP when hit by Water moves; Water immunity.',
		'id': 'waterabsorb',
		'name': 'Water Absorb',
		'num': 11
	},
	'waterbubble': {
		'desc': 'This Pokemon\'s Water-type attacks have their power doubled, the power of Fire-type attacks against this Pokemon is halved, and this Pokemon cannot be burned. Gaining this Ability while burned cures it.',
		'shortDesc': 'This Pokemon\'s Water power is 2x; it can\'t be burned; Fire power against it is halved.',
		'id': 'waterbubble',
		'name': 'Water Bubble',
		'num': 199
	},
	'watercompaction': {
		'shortDesc': 'This Pokemon\'s Defense is raised 2 stages after it is damaged by a Water-type move.',
		'id': 'watercompaction',
		'name': 'Water Compaction',
		'num': 195
	},
	'waterveil': {
		'shortDesc': 'This Pokemon cannot be burned. Gaining this Ability while burned cures it.',
		'id': 'waterveil',
		'name': 'Water Veil',
		'num': 41
	},
	'weakarmor': {
		'desc': 'If a physical attack hits this Pokemon, its Defense is lowered by 1 stage and its Speed is raised by 2 stages.',
		'shortDesc': 'If a physical attack hits this Pokemon, Defense is lowered by 1, Speed is raised by 2.',
		'id': 'weakarmor',
		'name': 'Weak Armor',
		'num': 133
	},
	'whitesmoke': {
		'shortDesc': 'Prevents other Pokemon from lowering this Pokemon\'s stat stages.',
		'id': 'whitesmoke',
		'name': 'White Smoke',
		'num': 73
	},
	'wimpout': {
		'shortDesc': 'This Pokemon switches out when it reaches 1/2 or less of its maximum HP.',
		'id': 'wimpout',
		'name': 'Wimp Out',
		'num': 193
	},
	'wonderguard': {
		'shortDesc': 'This Pokemon can only be damaged by supereffective moves and indirect damage.',
		'id': 'wonderguard',
		'name': 'Wonder Guard',
		'num': 25
	},
	'wonderskin': {
		'desc': 'All non-damaging moves that check accuracy have their accuracy changed to 50% when used on this Pokemon. This change is done before any other accuracy modifying effects.',
		'shortDesc': 'Status moves with accuracy checks are 50% accurate when used on this Pokemon.',
		'id': 'wonderskin',
		'name': 'Wonder Skin',
		'num': 147
	},
	'zenmode': {
		'desc': 'If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan\'s HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode. If Darmanitan loses this Ability while in Zen Mode it reverts to Standard Mode immediately.',
		'shortDesc': 'If Darmanitan, at end of turn changes Mode to Standard if > 1/2 max HP, else Zen.',
		'id': 'zenmode',
		'name': 'Zen Mode',
		'num': 161
	},
	'mountaineer': {
		'shortDesc': 'On switch-in, this Pokemon avoids all Rock-type attacks and Stealth Rock.',
		'id': 'mountaineer',
		'name': 'Mountaineer',
		'num': -2
	},
	'rebound': {
		'desc': 'On switch-in, this Pokemon blocks certain status moves and instead uses the move against the original user.',
		'shortDesc': 'On switch-in, blocks certain status moves and bounces them back to the user.',
		'id': 'rebound',
		'name': 'Rebound',
		'num': -3
	},
	'persistent': {
		'shortDesc': 'The duration of certain field effects is increased by 2 turns if used by this Pokemon.',
		'id': 'persistent',
		'name': 'Persistent',
		'num': -4
	}
};

module.exports = {BattleAbilities};