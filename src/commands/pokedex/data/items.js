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
const BattleItems = {
	'abomasite': {
		'id': 'abomasite',
		'name': 'Abomasite',
		'num': 674,
		'gen': 6,
		'desc': 'If holder is an Abomasnow, this item allows it to Mega Evolve in battle.'
	},
	'absolite': {
		'id': 'absolite',
		'name': 'Absolite',
		'num': 677,
		'gen': 6,
		'desc': 'If holder is an Absol, this item allows it to Mega Evolve in battle.'
	},
	'absorbbulb': {
		'id': 'absorbbulb',
		'name': 'Absorb Bulb',
		'num': 545,
		'gen': 5,
		'desc': 'Raises holder\'s Sp. Atk by 1 stage if hit by a Water-type attack. Single use.'
	},
	'adamantorb': {
		'id': 'adamantorb',
		'name': 'Adamant Orb',
		'num': 135,
		'gen': 4,
		'desc': 'If holder is a Dialga, its Steel- and Dragon-type attacks have 1.2x power.'
	},
	'adrenalineorb': {
		'id': 'adrenalineorb',
		'name': 'Adrenaline Orb',
		'num': 846,
		'gen': 7,
		'desc': 'Raises holder\'s Speed by 1 stage if it gets affected by Intimidate. Single use.'
	},
	'aerodactylite': {
		'id': 'aerodactylite',
		'name': 'Aerodactylite',
		'num': 672,
		'gen': 6,
		'desc': 'If holder is an Aerodactyl, this item allows it to Mega Evolve in battle.'
	},
	'aggronite': {
		'id': 'aggronite',
		'name': 'Aggronite',
		'num': 667,
		'gen': 6,
		'desc': 'If holder is an Aggron, this item allows it to Mega Evolve in battle.'
	},
	'aguavberry': {
		'id': 'aguavberry',
		'name': 'Aguav Berry',
		'num': 162,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.'
	},
	'airballoon': {
		'id': 'airballoon',
		'name': 'Air Balloon',
		'num': 541,
		'gen': 5,
		'desc': 'Holder is immune to Ground-type attacks. Pops when holder is hit.'
	},
	'alakazite': {
		'id': 'alakazite',
		'name': 'Alakazite',
		'num': 679,
		'gen': 6,
		'desc': 'If holder is an Alakazam, this item allows it to Mega Evolve in battle.'
	},
	'aloraichiumz': {
		'id': 'aloraichiumz',
		'name': 'Aloraichium Z',
		'num': 803,
		'gen': 7,
		'desc': 'If holder is an Alolan Raichu with Thunderbolt, it can use Stoked Sparksurfer.'
	},
	'altarianite': {
		'id': 'altarianite',
		'name': 'Altarianite',
		'num': 755,
		'gen': 6,
		'desc': 'If holder is an Altaria, this item allows it to Mega Evolve in battle.'
	},
	'ampharosite': {
		'id': 'ampharosite',
		'name': 'Ampharosite',
		'num': 658,
		'gen': 6,
		'desc': 'If holder is an Ampharos, this item allows it to Mega Evolve in battle.'
	},
	'apicotberry': {
		'id': 'apicotberry',
		'name': 'Apicot Berry',
		'num': 205,
		'gen': 3,
		'desc': 'Raises holder\'s Sp. Def by 1 stage when at 1/4 max HP or less. Single use.'
	},
	'armorfossil': {
		'id': 'armorfossil',
		'name': 'Armor Fossil',
		'num': 104,
		'gen': 4,
		'desc': 'Can be revived into Shieldon.'
	},
	'aspearberry': {
		'id': 'aspearberry',
		'name': 'Aspear Berry',
		'num': 153,
		'gen': 3,
		'desc': 'Holder is cured if it is frozen. Single use.'
	},
	'assaultvest': {
		'id': 'assaultvest',
		'name': 'Assault Vest',
		'num': 640,
		'gen': 6,
		'desc': 'Holder\'s Sp. Def is 1.5x, but it can only select damaging moves.'
	},
	'audinite': {
		'id': 'audinite',
		'name': 'Audinite',
		'num': 757,
		'gen': 6,
		'desc': 'If holder is an Audino, this item allows it to Mega Evolve in battle.'
	},
	'babiriberry': {
		'id': 'babiriberry',
		'name': 'Babiri Berry',
		'num': 199,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Steel-type attack. Single use.'
	},
	'banettite': {
		'id': 'banettite',
		'name': 'Banettite',
		'num': 668,
		'gen': 6,
		'desc': 'If holder is a Banette, this item allows it to Mega Evolve in battle.'
	},
	'beastball': {
		'id': 'beastball',
		'name': 'Beast Ball',
		'num': 851,
		'gen': 7,
		'desc': 'A special Poke Ball designed to catch Ultra Beasts.'
	},
	'beedrillite': {
		'id': 'beedrillite',
		'name': 'Beedrillite',
		'num': 770,
		'gen': 6,
		'desc': 'If holder is a Beedrill, this item allows it to Mega Evolve in battle.'
	},
	'belueberry': {
		'id': 'belueberry',
		'name': 'Belue Berry',
		'num': 183,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'berryjuice': {
		'id': 'berryjuice',
		'name': 'Berry Juice',
		'num': 43,
		'gen': 2,
		'desc': 'Restores 20 HP when at 1/2 max HP or less. Single use.'
	},
	'bigroot': {
		'id': 'bigroot',
		'name': 'Big Root',
		'num': 296,
		'gen': 4,
		'desc': 'Holder gains 1.3x HP from draining moves, Aqua Ring, Ingrain, and Leech Seed.'
	},
	'bindingband': {
		'id': 'bindingband',
		'name': 'Binding Band',
		'num': 544,
		'gen': 5,
		'desc': 'Holder\'s partial-trapping moves deal 1/6 max HP per turn instead of 1/8.'
	},
	'blackbelt': {
		'id': 'blackbelt',
		'name': 'Black Belt',
		'num': 241,
		'gen': 2,
		'desc': 'Holder\'s Fighting-type attacks have 1.2x power.'
	},
	'blacksludge': {
		'id': 'blacksludge',
		'name': 'Black Sludge',
		'num': 281,
		'gen': 4,
		'desc': 'Each turn, if holder is a Poison type, restores 1/16 max HP; loses 1/8 if not.'
	},
	'blackglasses': {
		'id': 'blackglasses',
		'name': 'Black Glasses',
		'num': 240,
		'gen': 2,
		'desc': 'Holder\'s Dark-type attacks have 1.2x power.'
	},
	'blastoisinite': {
		'id': 'blastoisinite',
		'name': 'Blastoisinite',
		'num': 661,
		'gen': 6,
		'desc': 'If holder is a Blastoise, this item allows it to Mega Evolve in battle.'
	},
	'blazikenite': {
		'id': 'blazikenite',
		'name': 'Blazikenite',
		'num': 664,
		'gen': 6,
		'desc': 'If holder is a Blaziken, this item allows it to Mega Evolve in battle.'
	},
	'blueorb': {
		'id': 'blueorb',
		'name': 'Blue Orb',
		'num': 535,
		'gen': 6,
		'desc': 'If holder is a Kyogre, this item triggers its Primal Reversion in battle.'
	},
	'blukberry': {
		'id': 'blukberry',
		'name': 'Bluk Berry',
	
		'num': 165,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'brightpowder': {
		'id': 'brightpowder',
		'name': 'BrightPowder',
		'num': 213,
		'gen': 2,
		'desc': 'The accuracy of attacks against the holder is 0.9x.'
	},
	'buggem': {
		'id': 'buggem',
		'name': 'Bug Gem',
		'num': 558,
		'gen': 5,
		'desc': 'Holder\'s first successful Bug-type attack will have 1.3x power. Single use.'
	},
	'bugmemory': {
		'id': 'bugmemory',
		'name': 'Bug Memory',
		'num': 909,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Bug type.'
	},
	'buginiumz': {
		'id': 'buginiumz',
		'name': 'Buginium Z',
		'num': 787,
		'gen': 7,
		'desc': 'If holder has a Bug move, this item allows it to use a Bug Z-Move.'
	},
	'burndrive': {
		'id': 'burndrive',
		'name': 'Burn Drive',
		'num': 118,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Fire type.'
	},
	'cameruptite': {
		'id': 'cameruptite',
		'name': 'Cameruptite',
		'num': 767,
		'gen': 6,
		'desc': 'If holder is a Camerupt, this item allows it to Mega Evolve in battle.'
	},
	'cellbattery': {
		'id': 'cellbattery',
		'name': 'Cell Battery',
		'num': 546,
		'gen': 5,
		'desc': 'Raises holder\'s Attack by 1 if hit by an Electric-type attack. Single use.'
	},
	'charcoal': {
		'id': 'charcoal',
		'name': 'Charcoal',
		'num': 249,
		'gen': 2,
		'desc': 'Holder\'s Fire-type attacks have 1.2x power.'
	},
	'charizarditex': {
		'id': 'charizarditex',
		'name': 'Charizardite X',
		'num': 660,
		'gen': 6,
		'desc': 'If holder is a Charizard, this item allows it to Mega Evolve in battle.'
	},
	'charizarditey': {
		'id': 'charizarditey',
		'name': 'Charizardite Y',
		'num': 678,
		'gen': 6,
		'desc': 'If holder is a Charizard, this item allows it to Mega Evolve in battle.'
	},
	'chartiberry': {
		'id': 'chartiberry',
		'name': 'Charti Berry',
		'num': 149,
		'gen': 3,
		'desc': 'Holder cures itself if it is paralyzed. Single use.'
	},
	'cherishball': {
		'id': 'cherishball',
		'name': 'Cherish Ball',
		'num': 16,
		'gen': 4,
		'desc': 'A rare Poke Ball that has been crafted to commemorate an occasion.'
	},
	'chestoberry': {
		'id': 'chestoberry',
		'name': 'Chesto Berry',
		'num': 150,
		'gen': 3,
		'desc': 'Holder wakes up if it is asleep. Single use.'
	},
	'chilanberry': {
		'id': 'chilanberry',
		'name': 'Chilan Berry',
		'num': 200,
		'gen': 4,
		'desc': 'Halves damage taken from a Normal-type attack. Single use.'
	},
	'chilldrive': {
		'id': 'chilldrive',
		'name': 'Chill Drive',
		'num': 119,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Ice type.'
	},
	'choiceband': {
		'id': 'choiceband',
		'name': 'Choice Band',
		'num': 220,
		'gen': 3,
		'desc': 'Holder\'s Attack is 1.5x, but it can only select the first move it executes.'
	},
	'choicescarf': {
		'id': 'choicescarf',
		'name': 'Choice Scarf',
		'num': 287,
		'gen': 4,
		'desc': 'Holder\'s Speed is 1.5x, but it can only select the first move it executes.'
	},
	'choicespecs': {
		'id': 'choicespecs',
		'name': 'Choice Specs',
		'num': 297,
		'gen': 4,
		'desc': 'Holder\'s Sp. Atk is 1.5x, but it can only select the first move it executes.'
	},
	'chopleberry': {
		'id': 'chopleberry',
		'name': 'Chople Berry',
		'num': 189,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Fighting-type attack. Single use.'
	},
	'clawfossil': {
		'id': 'clawfossil',
		'name': 'Claw Fossil',
		'num': 100,
		'gen': 3,
		'desc': 'Can be revived into Anorith.'
	},
	'cobaberry': {
		'id': 'cobaberry',
		'name': 'Coba Berry',
		'num': 192,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Flying-type attack. Single use.'
	},
	'colburberry': {
		'id': 'colburberry',
		'name': 'Colbur Berry',
		'num': 198,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Dark-type attack. Single use.'
	},
	'cornnberry': {
		'id': 'cornnberry',
		'name': 'Cornn Berry',
		'num': 175,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'coverfossil': {
		'id': 'coverfossil',
		'name': 'Cover Fossil',
		'num': 572,
		'gen': 5,
		'desc': 'Can be revived into Tirtouga.'
	},
	'custapberry': {
		'id': 'custapberry',
		'name': 'Custap Berry',
		'num': 210,
		'gen': 4,
		'desc': 'Holder moves first in its priority bracket when at 1/4 max HP or less. Single use.'
	},
	'damprock': {
		'id': 'damprock',
		'name': 'Damp Rock',
		'num': 285,
		'gen': 4,
		'desc': 'Holder\'s use of Rain Dance lasts 8 turns instead of 5.'
	},
	'darkgem': {
		'id': 'darkgem',
		'name': 'Dark Gem',
		'num': 562,
		'gen': 5,
		'desc': 'Holder\'s first successful Dark-type attack will have 1.3x power. Single use.'
	},
	'darkmemory': {
		'id': 'darkmemory',
		'name': 'Dark Memory',
		'num': 919,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Dark type.'
	},
	'darkiniumz': {
		'id': 'darkiniumz',
		'name': 'Darkinium Z',
		'num': 791,
		'gen': 7,
		'desc': 'If holder has a Dark move, this item allows it to use a Dark Z-Move.'
	},
	'decidiumz': {
		'id': 'decidiumz',
		'name': 'Decidium Z',
		'num': 798,
		'gen': 7,
		'desc': 'If holder is a Decidueye with Spirit Shackle, it can use Sinister Arrow Raid.'
	},
	'deepseascale': {
		'id': 'deepseascale',
		'name': 'DeepSeaScale',
		'num': 227,
		'gen': 3,
		'desc': 'If holder is a Clamperl, its Sp. Def is doubled.'
	},
	'deepseatooth': {
		'id': 'deepseatooth',
		'name': 'DeepSeaTooth',
		'num': 226,
		'gen': 3,
		'desc': 'If holder is a Clamperl, its Sp. Atk is doubled.'
	},
	'destinyknot': {
		'id': 'destinyknot',
		'name': 'Destiny Knot',
		'num': 280,
		'gen': 4,
		'desc': 'If holder becomes infatuated, the other Pokemon also becomes infatuated.'
	},
	'diancite': {
		'id': 'diancite',
		'name': 'Diancite',
		'num': 764,
		'gen': 6,
		'desc': 'If holder is a Diancie, this item allows it to Mega Evolve in battle.'
	},
	'diveball': {
		'id': 'diveball',
		'name': 'Dive Ball',
		'num': 7,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on Pokemon that live underwater.'
	},
	'domefossil': {
		'id': 'domefossil',
		'name': 'Dome Fossil',
		'num': 102,
		'gen': 3,
		'desc': 'Can be revived into Kabuto.'
	},
	'dousedrive': {
		'id': 'dousedrive',
		'name': 'Douse Drive',
		'num': 116,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Water type.'
	},
	'dracoplate': {
		'id': 'dracoplate',
		'name': 'Draco Plate',
		'num': 311,
		'gen': 4,
		'desc': 'Holder\'s Dragon-type attacks have 1.2x power. Judgment is Dragon type.'
	},
	'dragonfang': {
		'id': 'dragonfang',
		'name': 'Dragon Fang',
		'num': 250,
		'gen': 2,
		'desc': 'Holder\'s Dragon-type attacks have 1.2x power.'
	},
	'dragongem': {
		'id': 'dragongem',
		'name': 'Dragon Gem',
		'num': 561,
		'gen': 5,
		'desc': 'Holder\'s first successful Dragon-type attack will have 1.3x power. Single use.'
	},
	'dragonmemory': {
		'id': 'dragonmemory',
		'name': 'Dragon Memory',
		'num': 918,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Dragon type.'
	},
	'dragoniumz': {
		'id': 'dragoniumz',
		'name': 'Dragonium Z',
		'num': 790,
		'gen': 7,
		'desc': 'If holder has a Dragon move, this item allows it to use a Dragon Z-Move.'
	},
	'dreadplate': {
		'id': 'dreadplate',
		'name': 'Dread Plate',
		'num': 312,
		'gen': 4,
		'desc': 'Holder\'s Dark-type attacks have 1.2x power. Judgment is Dark type.'
	},
	'dreamball': {
		'id': 'dreamball',
		'name': 'Dream Ball',
		'num': 576,
		'gen': 5,
		'desc': 'A special Poke Ball that appears out of nowhere in a bag at the Entree Forest.'
	},
	'durinberry': {
		'id': 'durinberry',
		'name': 'Durin Berry',
	
		'num': 182,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'duskball': {
		'id': 'duskball',
		'name': 'Dusk Ball',
		'num': 13,
		'gen': 4,
		'desc': 'A Poke Ball that makes it easier to catch wild Pokemon at night or in caves.'
	},
	'earthplate': {
		'id': 'earthplate',
		'name': 'Earth Plate',
		'num': 305,
		'gen': 4,
		'desc': 'Holder\'s Ground-type attacks have 1.2x power. Judgment is Ground type.'
	},
	'eeviumz': {
		'id': 'eeviumz',
		'name': 'Eevium Z',
		'num': 805,
		'gen': 7,
		'desc': 'If holder is an Eevee with Last Resort, it can use Extreme Evoboost.'
	},
	'ejectbutton': {
		'id': 'ejectbutton',
		'name': 'Eject Button',
		'num': 547,
		'gen': 5,
		'desc': 'If holder survives a hit, it immediately switches out to a chosen ally. Single use.'
	},
	'electirizer': {
		'id': 'electirizer',
		'name': 'Electirizer',
		'num': 322,
		'gen': 4,
		'desc': 'Evolves Electabuzz into Electivire when traded.'
	},
	'electricgem': {
		'id': 'electricgem',
		'name': 'Electric Gem',
		'num': 550,
		'gen': 5,
		'desc': 'Holder\'s first successful Electric-type attack will have 1.3x power. Single use.'
	},
	'electricmemory': {
		'id': 'electricmemory',
		'name': 'Electric Memory',
		'num': 915,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Electric type.'
	},
	'electricseed': {
		'id': 'electricseed',
		'name': 'Electric Seed',
		'num': 881,
		'gen': 7,
		'desc': 'If the terrain is Electric Terrain, raises holder\'s Defense by 1 stage. Single use.'
	},
	'electriumz': {
		'id': 'electriumz',
		'name': 'Electrium Z',
		'num': 779,
		'gen': 7,
		'desc': 'If holder has an Electric move, this item allows it to use an Electric Z-Move.'
	},
	'energypowder': {
		'id': 'energypowder',
		'name': 'Energy Powder',
		'num': 34,
		'gen': 2,
		'desc': 'Restores 50 HP to one Pokemon but lowers Happiness.'
	},
	'enigmaberry': {
		'id': 'enigmaberry',
		'name': 'Enigma Berry',
		'num': 538,
		'gen': 5,
		'desc': 'If holder\'s species can evolve, its Defense and Sp. Def are 1.5x.'
	},
	'expertbelt': {
		'id': 'expertbelt',
		'name': 'Expert Belt',
		'num': 268,
		'gen': 4,
		'desc': 'Holder\'s attacks that are super effective against the target do 1.2x damage.'
	},
	'fairiumz': {
		'id': 'fairiumz',
		'name': 'Fairium Z',
		'num': 793,
		'gen': 7,
		'desc': 'If holder has a Fairy move, this item allows it to use a Fairy Z-Move.'
	},
	'fairygem': {
		'id': 'fairygem',
		'name': 'Fairy Gem',
		'num': 715,
		'gen': 6,
		'desc': 'Holder\'s first successful Fairy-type attack will have 1.3x power. Single use.'
	},
	'fairymemory': {
		'id': 'fairymemory',
		'name': 'Fairy Memory',
		'num': 920,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fairy type.'
	},
	'fastball': {
		'id': 'fastball',
		'name': 'Fast Ball',
		'num': 492,
		'gen': 2,
		'desc': 'A Poke Ball that makes it easier to catch Pokemon which are quick to run away.'
	},
	'fightinggem': {
		'id': 'fightinggem',
		'name': 'Fighting Gem',
		'num': 553,
		'gen': 5,
		'desc': 'Holder\'s first successful Fighting-type attack will have 1.3x power. Single use.'
	},
	'fightingmemory': {
		'id': 'fightingmemory',
		'name': 'Fighting Memory',
		'num': 904,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fighting type.'
	},
	'fightiniumz': {
		'id': 'fightiniumz',
		'name': 'Fightinium Z',
		'num': 782,
		'gen': 7,
		'desc': 'If holder has a Fighting move, this item allows it to use a Fighting Z-Move.'
	},
	'figyberry': {
		'id': 'figyberry',
		'name': 'Figy Berry',
		'num': 159,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.'
	},
	'firegem': {
		'id': 'firegem',
		'name': 'Fire Gem',
		'num': 548,
		'gen': 5,
		'desc': 'Holder\'s first successful Fire-type attack will have 1.3x power. Single use.'
	},
	'firememory': {
		'id': 'firememory',
		'name': 'Fire Memory',
		'num': 912,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fire type.'
	},
	'firiumz': {
		'id': 'firiumz',
		'name': 'Firium Z',
		'num': 777,
		'gen': 7,
		'desc': 'If holder has a Fire move, this item allows it to use a Fire Z-Move.'
	},
	'fistplate': {
		'id': 'fistplate',
		'name': 'Fist Plate',
		'num': 303,
		'gen': 4,
		'desc': 'Holder\'s Fighting-type attacks have 1.2x power. Judgment is Fighting type.'
	},
	'flameorb': {
		'id': 'flameorb',
		'name': 'Flame Orb',
		'num': 273,
		'gen': 4,
		'desc': 'At the end of every turn, this item attempts to burn the holder.'
	},
	'flameplate': {
		'id': 'flameplate',
		'name': 'Flame Plate',
		'num': 298,
		'gen': 4,
		'desc': 'Holder\'s Fire-type attacks have 1.2x power. Judgment is Fire type.'
	},
	'floatstone': {
		'id': 'floatstone',
		'name': 'Float Stone',
		'num': 539,
		'gen': 5,
		'desc': 'Holder\'s weight is halved.'
	},
	'flyinggem': {
		'id': 'flyinggem',
		'name': 'Flying Gem',
		'num': 556,
		'gen': 5,
		'desc': 'Holder\'s first successful Flying-type attack will have 1.3x power. Single use.'
	},
	'flyingmemory': {
		'id': 'flyingmemory',
		'name': 'Flying Memory',
		'num': 905,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Flying type.'
	},
	'flyiniumz': {
		'id': 'flyiniumz',
		'name': 'Flyinium Z',
		'num': 785,
		'gen': 7,
		'desc': 'If holder has a Flying move, this item allows it to use a Flying Z-Move.'
	},
	'focusband': {
		'id': 'focusband',
		'name': 'Focus Band',
		'num': 230,
		'gen': 2,
		'desc': 'Holder has a 10% chance to survive an attack that would KO it with 1 HP.'
	},
	'focussash': {
		'id': 'focussash',
		'name': 'Focus Sash',
		'num': 275,
		'gen': 4,
		'desc': 'If holder\'s HP is full, will survive an attack that would KO it with 1 HP. Single use.'
	},
	'friendball': {
		'id': 'friendball',
		'name': 'Friend Ball',
		'num': 497,
		'gen': 2,
		'desc': 'A Poke Ball that makes caught Pokemon more friendly.'
	},
	'fullincense': {
		'id': 'fullincense',
		'name': 'Full Incense',
		'num': 316,
		'gen': 4,
		'desc': 'Holder moves last in its priority bracket.'
	},
	'galladite': {
		'id': 'galladite',
		'name': 'Galladite',
		'num': 756,
		'gen': 6,
		'desc': 'If holder is a Gallade, this item allows it to Mega Evolve in battle.'
	},
	'ganlonberry': {
		'id': 'ganlonberry',
		'name': 'Ganlon Berry',
		'num': 202,
		'gen': 3,
		'desc': 'Raises holder\'s Defense by 1 stage when at 1/4 max HP or less. Single use.'
	},
	'garchompite': {
		'id': 'garchompite',
		'name': 'Garchompite',
		'num': 683,
		'gen': 6,
		'desc': 'If holder is a Garchomp, this item allows it to Mega Evolve in battle.'
	},
	'gardevoirite': {
		'id': 'gardevoirite',
		'name': 'Gardevoirite',
		'num': 657,
		'gen': 6,
		'desc': 'If holder is a Gardevoir, this item allows it to Mega Evolve in battle.'
	},
	'gengarite': {
		'id': 'gengarite',
		'name': 'Gengarite',
		'num': 656,
		'gen': 6,
		'desc': 'If holder is a Gengar, this item allows it to Mega Evolve in battle.'
	},
	'ghostgem': {
		'id': 'ghostgem',
		'name': 'Ghost Gem',
		'num': 560,
		'gen': 5,
		'desc': 'Holder\'s first successful Ghost-type attack will have 1.3x power. Single use.'
	},
	'ghostmemory': {
		'id': 'ghostmemory',
		'name': 'Ghost Memory',
		'num': 910,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ghost type.'
	},
	'ghostiumz': {
		'id': 'ghostiumz',
		'name': 'Ghostium Z',
		'num': 789,
		'gen': 7,
		'desc': 'If holder has a Ghost move, this item allows it to use a Ghost Z-Move.'
	},
	'glalitite': {
		'id': 'glalitite',
		'name': 'Glalitite',
		'num': 763,
		'gen': 6,
		'desc': 'If holder is a Glalie, this item allows it to Mega Evolve in battle.'
	},
	'grassgem': {
		'id': 'grassgem',
		'name': 'Grass Gem',
		'num': 551,
		'gen': 5,
		'desc': 'Holder\'s first successful Grass-type attack will have 1.3x power. Single use.'
	},
	'grassmemory': {
		'id': 'grassmemory',
		'name': 'Grass Memory',
		'num': 914,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Grass type.'
	},
	'grassiumz': {
		'id': 'grassiumz',
		'name': 'Grassium Z',
		'num': 780,
		'gen': 7,
		'desc': 'If holder has a Grass move, this item allows it to use a Grass Z-Move.'
	},
	'grassyseed': {
		'id': 'grassyseed',
		'name': 'Grassy Seed',
		'num': 884,
		'gen': 7,
		'desc': 'If the terrain is Grassy Terrain, raises holder\'s Defense by 1 stage. Single use.'
	},
	'greatball': {
		'id': 'greatball',
		'name': 'Great Ball',
		'num': 3,
		'gen': 1,
		'desc': 'A high-performance Ball that provides a higher catch rate than a Poke Ball.'
	},
	'grepaberry': {
		'id': 'grepaberry',
		'name': 'Grepa Berry',
	
		'num': 173,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'gripclaw': {
		'id': 'gripclaw',
		'name': 'Grip Claw',
		'num': 286,
		'gen': 4,
		'desc': 'Holder\'s partial-trapping moves always last 7 turns.'
	},
	'griseousorb': {
		'id': 'griseousorb',
		'name': 'Griseous Orb',
		'num': 112,
		'gen': 4,
		'desc': 'If holder is a Giratina, its Ghost- and Dragon-type attacks have 1.2x power.'
	},
	'groundgem': {
		'id': 'groundgem',
		'name': 'Ground Gem',
		'num': 555,
		'gen': 5,
		'desc': 'Holder\'s first successful Ground-type attack will have 1.3x power. Single use.'
	},
	'groundmemory': {
		'id': 'groundmemory',
		'name': 'Ground Memory',
		'num': 907,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ground type.'
	},
	'groundiumz': {
		'id': 'groundiumz',
		'name': 'Groundium Z',
		'num': 784,
		'gen': 7,
		'desc': 'If holder has a Ground move, this item allows it to use a Ground Z-Move.'
	},
	'gyaradosite': {
		'id': 'gyaradosite',
		'name': 'Gyaradosite',
		'num': 676,
		'gen': 6,
		'desc': 'If holder is a Gyarados, this item allows it to Mega Evolve in battle.'
	},
	'habanberry': {
		'id': 'habanberry',
		'name': 'Haban Berry',
		'num': 197,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Dragon-type attack. Single use.'
	},
	'hardstone': {
		'id': 'hardstone',
		'name': 'Hard Stone',
		'num': 238,
		'gen': 2,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power.'
	},
	'healball': {
		'id': 'healball',
		'name': 'Heal Ball',
		'num': 14,
		'gen': 4,
		'desc': 'A remedial Poke Ball that restores the caught Pokemon\'s HP and status problem.'
	},
	'heatrock': {
		'id': 'heatrock',
		'name': 'Heat Rock',
		'num': 284,
		'gen': 4,
		'desc': 'Holder\'s use of Sunny Day lasts 8 turns instead of 5.'
	},
	'heavyball': {
		'id': 'heavyball',
		'name': 'Heavy Ball',
		'num': 495,
		'gen': 2,
		'desc': 'A Poke Ball for catching very heavy Pokemon.'
	},
	'helixfossil': {
		'id': 'helixfossil',
		'name': 'Helix Fossil',
		'num': 101,
		'gen': 3,
		'desc': 'Can be revived into Omanyte.'
	},
	'heracronite': {
		'id': 'heracronite',
		'name': 'Heracronite',
		'num': 680,
		'gen': 6,
		'desc': 'If holder is a Heracross, this item allows it to Mega Evolve in battle.'
	},
	'hondewberry': {
		'id': 'hondewberry',
		'name': 'Hondew Berry',
	
		'num': 172,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'houndoominite': {
		'id': 'houndoominite',
		'name': 'Houndoominite',
		'num': 666,
		'gen': 6,
		'desc': 'If holder is a Houndoom, this item allows it to Mega Evolve in battle.'
	},
	'iapapaberry': {
		'id': 'iapapaberry',
		'name': 'Iapapa Berry',
		'num': 163,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.'
	},
	'icegem': {
		'id': 'icegem',
		'name': 'Ice Gem',
		'num': 552,
		'gen': 5,
		'desc': 'Holder\'s first successful Ice-type attack will have 1.3x power. Single use.'
	},
	'icememory': {
		'id': 'icememory',
		'name': 'Ice Memory',
		'num': 917,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ice type.'
	},
	'icicleplate': {
		'id': 'icicleplate',
		'name': 'Icicle Plate',
		'num': 302,
		'gen': 4,
		'desc': 'Holder\'s Ice-type attacks have 1.2x power. Judgment is Ice type.'
	},
	'iciumz': {
		'id': 'iciumz',
		'name': 'Icium Z',
		'num': 781,
		'gen': 7,
		'desc': 'If holder has an Ice move, this item allows it to use an Ice Z-Move.'
	},
	'icyrock': {
		'id': 'icyrock',
		'name': 'Icy Rock',
		'num': 282,
		'gen': 4,
		'desc': 'Holder\'s use of Hail lasts 8 turns instead of 5.'
	},
	'inciniumz': {
		'id': 'inciniumz',
		'name': 'Incinium Z',
		'num': 799,
		'gen': 7,
		'desc': 'If holder is an Incineroar with Darkest Lariat, it can use Malicious Moonsault.'
	},
	'insectplate': {
		'id': 'insectplate',
		'name': 'Insect Plate',
		'num': 308,
		'gen': 4,
		'desc': 'Holder\'s Bug-type attacks have 1.2x power. Judgment is Bug type.'
	},
	'ironball': {
		'id': 'ironball',
		'name': 'Iron Ball',
		'num': 278,
		'gen': 4,
		'desc': 'Holder is grounded, Speed halved. If Flying type, takes neutral Ground damage.'
	},
	'ironplate': {
		'id': 'ironplate',
		'name': 'Iron Plate',
		'num': 313,
		'gen': 4,
		'desc': 'Holder\'s Steel-type attacks have 1.2x power. Judgment is Steel type.'
	},
	'jabocaberry': {
		'id': 'jabocaberry',
		'name': 'Jaboca Berry',
		'num': 211,
		'gen': 4,
		'desc': 'If holder is hit by a physical move, attacker loses 1/8 of its max HP. Single use.'
	},
	'kasibberry': {
		'id': 'kasibberry',
		'name': 'Kasib Berry',
		'num': 196,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ghost-type attack. Single use.'
	},
	'kebiaberry': {
		'id': 'kebiaberry',
		'name': 'Kebia Berry',
		'num': 190,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Poison-type attack. Single use.'
	},
	'keeberry': {
		'id': 'keeberry',
		'name': 'Kee Berry',
		'num': 687,
		'gen': 6,
		'desc': 'Raises holder\'s Defense by 1 stage after it is hit by a physical attack. Single use.'
	},
	'kelpsyberry': {
		'id': 'kelpsyberry',
		'name': 'Kelpsy Berry',
	
		'num': 170,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'kangaskhanite': {
		'id': 'kangaskhanite',
		'name': 'Kangaskhanite',
		'num': 675,
		'gen': 6,
		'desc': 'If holder is a Kangaskhan, this item allows it to Mega Evolve in battle.'
	},
	'kingsrock': {
		'id': 'kingsrock',
		'name': 'King\'s Rock',
		'num': 221,
		'gen': 2,
		'desc': 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
	},
	'laggingtail': {
		'id': 'laggingtail',
		'name': 'Lagging Tail',
		'num': 279,
		'gen': 4,
		'desc': 'Holder moves last in its priority bracket.'
	},
	'lansatberry': {
		'id': 'lansatberry',
		'name': 'Lansat Berry',
		'num': 206,
		'gen': 3,
		'desc': 'Holder gains the Focus Energy effect when at 1/4 max HP or less. Single use.'
	},
	'latiasite': {
		'id': 'latiasite',
		'name': 'Latiasite',
		'num': 684,
		'gen': 6,
		'desc': 'If holder is a Latias, this item allows it to Mega Evolve in battle.'
	},
	'latiosite': {
		'id': 'latiosite',
		'name': 'Latiosite',
		'num': 685,
		'gen': 6,
		'desc': 'If holder is a Latios, this item allows it to Mega Evolve in battle.'
	},
	'laxincense': {
		'id': 'laxincense',
		'name': 'Lax Incense',
		'num': 255,
		'gen': 3,
		'desc': 'The accuracy of attacks against the holder is 0.9x.'
	},
	'leftovers': {
		'id': 'leftovers',
		'name': 'Leftovers',
		'num': 234,
		'gen': 2,
		'desc': 'At the end of every turn, holder restores 1/16 of its max HP.'
	},
	'leppaberry': {
		'id': 'leppaberry',
		'name': 'Leppa Berry',
		
		'num': 154,
		'gen': 3,
		'desc': 'Restores 10 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
	},
	'levelball': {
		'id': 'levelball',
		'name': 'Level Ball',
		'num': 493,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon that are a lower level than your own.'
	},
	'liechiberry': {
		'id': 'liechiberry',
		'name': 'Liechi Berry',
		'num': 201,
		'gen': 3,
		'desc': 'Raises holder\'s Attack by 1 stage when at 1/4 max HP or less. Single use.'
	},
	'lifeorb': {
		'id': 'lifeorb',
		'name': 'Life Orb',
		'num': 270,
		'gen': 4,
		'desc': 'Holder\'s attacks do 1.3x damage, and it loses 1/10 its max HP after the attack.'
	},
	'lightball': {
		'id': 'lightball',
		'name': 'Light Ball',
		'num': 236,
		'gen': 2,
		'desc': 'If holder is a Pikachu, its Attack and Sp. Atk are doubled.'
	},
	'lightclay': {
		'id': 'lightclay',
		'name': 'Light Clay',
		'num': 269,
		'gen': 4,
		'desc': 'Holder\'s use of Light Screen or Reflect lasts 8 turns instead of 5.'
	},
	'lopunnite': {
		'id': 'lopunnite',
		'name': 'Lopunnite',
		'num': 768,
		'gen': 6,
		'desc': 'If holder is a Lopunny, this item allows it to Mega Evolve in battle.'
	},
	'loveball': {
		'id': 'loveball',
		'name': 'Love Ball',
		'num': 496,
		'gen': 2,
		'desc': 'Poke Ball for catching Pokemon that are the opposite gender of your Pokemon.'
	},
	'lucarionite': {
		'id': 'lucarionite',
		'name': 'Lucarionite',
		'num': 673,
		'gen': 6,
		'desc': 'If holder is a Lucario, this item allows it to Mega Evolve in battle.'
	},
	'luckypunch': {
		'id': 'luckypunch',
		'name': 'Lucky Punch',
		'num': 256,
		'gen': 2,
		'desc': 'If holder is a Chansey, its critical hit ratio is raised by 2 stages.'
	},
	'lumberry': {
		'id': 'lumberry',
		'name': 'Lum Berry',
		'num': 157,
		'gen': 3,
		'desc': 'Holder cures itself if it is confused or has a major status condition. Single use.'
	},
	'luminousmoss': {
		'id': 'luminousmoss',
		'name': 'Luminous Moss',
		'num': 648,
		'gen': 6,
		'desc': 'Raises holder\'s Sp. Def by 1 stage if hit by a Water-type attack. Single use.'
	},
	'lureball': {
		'id': 'lureball',
		'name': 'Lure Ball',
		'num': 494,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon hooked by a Rod when fishing.'
	},
	'lustrousorb': {
		'id': 'lustrousorb',
		'name': 'Lustrous Orb',
		'num': 136,
		'gen': 4,
		'desc': 'If holder is a Palkia, its Water- and Dragon-type attacks have 1.2x power.'
	},
	'luxuryball': {
		'id': 'luxuryball',
		'name': 'Luxury Ball',
		'num': 11,
		'gen': 3,
		'desc': 'A comfortable Poke Ball that makes a caught wild Pokemon quickly grow friendly.'
	},
	'machobrace': {
		'id': 'machobrace',
		'name': 'Macho Brace',
		'num': 215,
		'gen': 3,
		'desc': 'Holder\'s Speed is halved.'
	},
	'magnet': {
		'id': 'magnet',
		'name': 'Magnet',
		'num': 242,
		'gen': 2,
		'desc': 'Holder\'s Electric-type attacks have 1.2x power.'
	},
	'magoberry': {
		'id': 'magoberry',
		'name': 'Mago Berry',
		'num': 161,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Spe Nature. Single use.'
	},
	'magostberry': {
		'id': 'magostberry',
		'name': 'Magost Berry',
	
		'num': 176,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'mail': {
		'id': 'mail',
		'name': 'Mail',
		'gen': 2,
		'desc': 'Cannot be given to or taken from a Pokemon, except by Covet/Knock Off/Thief.'
	},
	'manectite': {
		'id': 'manectite',
		'name': 'Manectite',
		'num': 682,
		'gen': 6,
		'desc': 'If holder is a Manectric, this item allows it to Mega Evolve in battle.'
	},
	'marangaberry': {
		'id': 'marangaberry',
		'name': 'Maranga Berry',
		'num': 688,
		'gen': 6,
		'desc': 'Raises holder\'s Sp. Def by 1 stage after it is hit by a special attack. Single use.'
	},
	'marshadiumz': {
		'id': 'marshadiumz',
		'name': 'Marshadium Z',
		'num': 802,
		'gen': 7,
		'desc': 'If holder is Marshadow with Spectral Thief, it can use Soul-Stealing 7-Star Strike.'
	},
	'masterball': {
		'id': 'masterball',
		'name': 'Master Ball',
		'num': 1,
		'gen': 1,
		'desc': 'The best Ball with the ultimate performance. It will catch any wild Pokemon.'
	},
	'mawilite': {
		'id': 'mawilite',
		'name': 'Mawilite',
		'num': 681,
		'gen': 6,
		'desc': 'If holder is a Mawile, this item allows it to Mega Evolve in battle.'
	},
	'meadowplate': {
		'id': 'meadowplate',
		'name': 'Meadow Plate',
		'num': 301,
		'gen': 4,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power. Judgment is Grass type.'
	},
	'medichamite': {
		'id': 'medichamite',
		'name': 'Medichamite',
		'num': 665,
		'gen': 6,
		'desc': 'If holder is a Medicham, this item allows it to Mega Evolve in battle.'
	},
	'mentalherb': {
		'id': 'mentalherb',
		'name': 'Mental Herb',
		'num': 219,
		'gen': 3,
		'desc': 'Cures holder of Attract, Disable, Encore, Heal Block, Taunt, Torment. Single use.'
	},
	'metagrossite': {
		'id': 'metagrossite',
		'name': 'Metagrossite',
		'num': 758,
		'gen': 6,
		'desc': 'If holder is a Metagross, this item allows it to Mega Evolve in battle.'
	},
	'metalcoat': {
		'id': 'metalcoat',
		'name': 'Metal Coat',
		'num': 233,
		'gen': 2,
		'desc': 'Holder\'s Steel-type attacks have 1.2x power.'
	},
	'metalpowder': {
		'id': 'metalpowder',
		'name': 'Metal Powder',
		'onModifyDefPriority': 2,
		'num': 257,
		'gen': 2,
		'desc': 'If holder is a Ditto that hasn\'t Transformed, its Defense is doubled.'
	},
	'metronome': {
		'id': 'metronome',
		'name': 'Metronome',
		'num': 277,
		'gen': 4,
		'desc': 'Damage of moves used on consecutive turns is increased. Max 2x after 5 turns.'
	},
	'mewniumz': {
		'id': 'mewniumz',
		'name': 'Mewnium Z',
		'num': 806,
		'gen': 7,
		'desc': 'If holder is a Mew with Psychic, it can use Genesis Supernova.'
	},
	'mewtwonitex': {
		'id': 'mewtwonitex',
		'name': 'Mewtwonite X',
		'num': 662,
		'gen': 6,
		'desc': 'If holder is a Mewtwo, this item allows it to Mega Evolve in battle.'
	},
	'mewtwonitey': {
		'id': 'mewtwonitey',
		'name': 'Mewtwonite Y',
		'num': 663,
		'gen': 6,
		'desc': 'If holder is a Mewtwo, this item allows it to Mega Evolve in battle.'
	},
	'micleberry': {
		'id': 'micleberry',
		'name': 'Micle Berry',
		'num': 209,
		'gen': 4,
		'desc': 'Holder\'s next move has 1.2x accuracy when at 1/4 max HP or less. Single use.'
	},
	'mindplate': {
		'id': 'mindplate',
		'name': 'Mind Plate',
		'num': 307,
		'gen': 4,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power. Judgment is Psychic type.'
	},
	'miracleseed': {
		'id': 'miracleseed',
		'name': 'Miracle Seed',
		'num': 239,
		'gen': 2,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power.'
	},
	'mistyseed': {
		'id': 'mistyseed',
		'name': 'Misty Seed',
		'num': 883,
		'gen': 7,
		'desc': 'If the terrain is Misty Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
	},
	'moonball': {
		'id': 'moonball',
		'name': 'Moon Ball',
		'num': 498,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon that evolve using the Moon Stone.'
	},
	'muscleband': {
		'id': 'muscleband',
		'name': 'Muscle Band',
		'num': 266,
		'gen': 4,
		'desc': 'Holder\'s physical attacks have 1.1x power.'
	},
	'mysticwater': {
		'id': 'mysticwater',
		'name': 'Mystic Water',
		'num': 243,
		'gen': 2,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	'nanabberry': {
		'id': 'nanabberry',
		'name': 'Nanab Berry',
	
		'num': 166,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'nestball': {
		'id': 'nestball',
		'name': 'Nest Ball',
		'num': 8,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on weaker Pokemon in the wild.'
	},
	'netball': {
		'id': 'netball',
		'name': 'Net Ball',
		'num': 6,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on Water- and Bug-type Pokemon.'
	},
	'nevermeltice': {
		'id': 'nevermeltice',
		'name': 'Never-Melt Ice',
		'num': 246,
		'gen': 2,
		'desc': 'Holder\'s Ice-type attacks have 1.2x power.'
	},
	'nomelberry': {
		'id': 'nomelberry',
		'name': 'Nomel Berry',
	
		'num': 178,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'normalgem': {
		'id': 'normalgem',
		'name': 'Normal Gem',
		'num': 564,
		'gen': 5,
		'desc': 'Holder\'s first successful Normal-type attack will have 1.3x power. Single use.'
	},
	'normaliumz': {
		'id': 'normaliumz',
		'name': 'Normalium Z',
		'num': 776,
		'gen': 7,
		'desc': 'If holder has a Normal move, this item allows it to use a Normal Z-Move.'
	},
	'occaberry': {
		'id': 'occaberry',
		'name': 'Occa Berry',
		'num': 184,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Fire-type attack. Single use.'
	},
	'oddincense': {
		'id': 'oddincense',
		'name': 'Odd Incense',
		'num': 314,
		'gen': 4,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power.'
	},
	'oldamber': {
		'id': 'oldamber',
		'name': 'Old Amber',
		'num': 103,
		'gen': 3,
		'desc': 'Can be revived into Aerodactyl.'
	},
	'oranberry': {
		'id': 'oranberry',
		'name': 'Oran Berry',
		'num': 155,
		'gen': 3,
		'desc': 'Restores 10 HP when at 1/2 max HP or less. Single use.'
	},
	'pamtreberry': {
		'id': 'pamtreberry',
		'name': 'Pamtre Berry',
	
		'num': 180,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'parkball': {
		'id': 'parkball',
		'name': 'Park Ball',
		'num': 500,
		'gen': 4,
		'desc': 'A special Poke Ball for the Pal Park.'
	},
	'passhoberry': {
		'id': 'passhoberry',
		'name': 'Passho Berry',
		'num': 185,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Water-type attack. Single use.'
	},
	'payapaberry': {
		'id': 'payapaberry',
		'name': 'Payapa Berry',
		'num': 151,
		'gen': 3,
		'desc': 'Holder is cured if it is poisoned. Single use.'
	},
	'persimberry': {
		'id': 'persimberry',
		'name': 'Persim Berry',
		'num': 156,
		'gen': 3,
		'desc': 'Holder is cured if it is confused. Single use.'
	},
	'petayaberry': {
		'id': 'petayaberry',
		'name': 'Petaya Berry',
		'num': 204,
		'gen': 3,
		'desc': 'Raises holder\'s Sp. Atk by 1 stage when at 1/4 max HP or less. Single use.'
	},
	'pidgeotite': {
		'id': 'pidgeotite',
		'name': 'Pidgeotite',
		'num': 762,
		'gen': 6,
		'desc': 'If holder is a Pidgeot, this item allows it to Mega Evolve in battle.'
	},
	'pikaniumz': {
		'id': 'pikaniumz',
		'name': 'Pikanium Z',
		'num': 794,
		'gen': 7,
		'desc': 'If holder is a Pikachu with Volt Tackle, it can use Catastropika.'
	},
	'pikashuniumz': {
		'id': 'pikashuniumz',
		'name': 'Pikashunium Z',
		'num': 836,
		'gen': 7,
		'desc': 'If holder is cap Pikachu with Thunderbolt, it can use 10,000,000 Volt Thunderbolt.'
	},
	'pinapberry': {
		'id': 'pinapberry',
		'name': 'Pinap Berry',
	
		'num': 168,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'pinsirite': {
		'id': 'pinsirite',
		'name': 'Pinsirite',
		'num': 671,
		'gen': 6,
		'desc': 'If holder is a Pinsir, this item allows it to Mega Evolve in battle.'
	},
	'pixieplate': {
		'id': 'pixieplate',
		'name': 'Pixie Plate',
		'num': 644,
		'gen': 6,
		'desc': 'Holder\'s Fairy-type attacks have 1.2x power. Judgment is Fairy type.'
	},
	'plumefossil': {
		'id': 'plumefossil',
		'name': 'Plume Fossil',
		'num': 573,
		'gen': 5,
		'desc': 'Can be revived into Archen.'
	},
	'poisonbarb': {
		'id': 'poisonbarb',
		'name': 'Poison Barb',
		'num': 245,
		'gen': 2,
		'desc': 'Holder\'s Poison-type attacks have 1.2x power.'
	},
	'poisongem': {
		'id': 'poisongem',
		'name': 'Poison Gem',
		'num': 554,
		'gen': 5,
		'desc': 'Holder\'s first successful Poison-type attack will have 1.3x power. Single use.'
	},
	'poisonmemory': {
		'id': 'poisonmemory',
		'name': 'Poison Memory',
		'num': 906,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Poison type.'
	},
	'poisoniumz': {
		'id': 'poisoniumz',
		'name': 'Poisonium Z',
		'num': 783,
		'gen': 7,
		'desc': 'If holder has a Poison move, this item allows it to use a Poison Z-Move.'
	},
	'pokeball': {
		'id': 'pokeball',
		'name': 'Poke Ball',
		'num': 4,
		'gen': 1,
		'desc': 'A device for catching wild Pokemon. It is designed as a capsule system.'
	},
	'pomegberry': {
		'id': 'pomegberry',
		'name': 'Pomeg Berry',
	
		'num': 169,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'powerherb': {
		'id': 'powerherb',
		'name': 'Power Herb',
		'num': 271,
		'gen': 4,
		'desc': 'Holder\'s two-turn moves complete in one turn (except Sky Drop). Single use.'
	},
	'premierball': {
		'id': 'premierball',
		'name': 'Premier Ball',
		'num': 12,
		'gen': 3,
		'desc': 'A rare Poke Ball that has been crafted to commemorate an event.'
	},
	'primariumz': {
		'id': 'primariumz',
		'name': 'Primarium Z',
		'num': 800,
		'gen': 7,
		'desc': 'If holder is a Primarina with Sparkling Aria, it can use Oceanic Operetta.'
	},
	'protectivepads': {
		'id': 'protectivepads',
		'name': 'Protective Pads',
		'num': 880,
		'gen': 7,
		'desc': 'Holder\'s attacks do not make contact with the target.'
	},
	'psychicgem': {
		'id': 'psychicgem',
		'name': 'Psychic Gem',
		'num': 557,
		'gen': 5,
		'desc': 'Holder\'s first successful Psychic-type attack will have 1.3x power. Single use.'
	},
	'psychicmemory': {
		'id': 'psychicmemory',
		'name': 'Psychic Memory',
		'num': 916,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Psychic type.'
	},
	'psychicseed': {
		'id': 'psychicseed',
		'name': 'Psychic Seed',
		'num': 882,
		'gen': 7,
		'desc': 'If the terrain is Psychic Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
	},
	'psychiumz': {
		'id': 'psychiumz',
		'name': 'Psychium Z',
		'num': 786,
		'gen': 7,
		'desc': 'If holder has a Psychic move, this item allows it to use a Psychic Z-Move.'
	},
	'qualotberry': {
		'id': 'qualotberry',
		'name': 'Qualot Berry',
	
		'num': 171,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'quickball': {
		'id': 'quickball',
		'name': 'Quick Ball',
		'num': 15,
		'gen': 4,
		'desc': 'A Poke Ball that provides a better catch rate at the start of a wild encounter.'
	},
	'quickclaw': {
		'id': 'quickclaw',
		'name': 'Quick Claw',
		'num': 217,
		'gen': 2,
		'desc': 'Each turn, holder has a 20% chance to move first in its priority bracket.'
	},
	'quickpowder': {
		'id': 'quickpowder',
		'name': 'Quick Powder',
		'num': 274,
		'gen': 4,
		'desc': 'If holder is a Ditto that hasn\'t Transformed, its Speed is doubled.'
	},
	'rabutaberry': {
		'id': 'rabutaberry',
		'name': 'Rabuta Berry',
	
		'num': 177,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'rarebone': {
		'id': 'rarebone',
		'name': 'Rare Bone',
		'num': 106,
		'gen': 4,
		'desc': 'No competitive use other than when used with Fling.'
	},
	'rawstberry': {
		'id': 'rawstberry',
		'name': 'Rawst Berry',
		'num': 152,
		'gen': 3,
		'desc': 'Holder is cured if it is burned. Single use.'
	},
	'razorclaw': {
		'id': 'razorclaw',
		'name': 'Razor Claw',
		'num': 326,
		'gen': 4,
		'desc': 'Holder\'s critical hit ratio is raised by 1 stage.'
	},
	'razorfang': {
		'id': 'razorfang',
		'name': 'Razor Fang',
		'num': 327,
		'gen': 4,
		'desc': 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
	},
	'razzberry': {
		'id': 'razzberry',
		'name': 'Razz Berry',
	
		'num': 164,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'redcard': {
		'id': 'redcard',
		'name': 'Red Card',
		'num': 542,
		'gen': 5,
		'desc': 'If holder survives a hit, attacker is forced to switch to a random ally. Single use.'
	},
	'redorb': {
		'id': 'redorb',
		'name': 'Red Orb',
		'num': 534,
		'gen': 6,
		'desc': 'If holder is a Groudon, this item triggers its Primal Reversion in battle.'
	},
	'repeatball': {
		'id': 'repeatball',
		'name': 'Repeat Ball',
		'num': 9,
		'gen': 3,
		'desc': 'A Poke Ball that works well on Pokemon species that were previously caught.'
	},
	'rindoberry': {
		'id': 'rindoberry',
		'name': 'Rindo Berry',
		'num': 187,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Grass-type attack. Single use.'
	},
	'ringtarget': {
		'id': 'ringtarget',
		'name': 'Ring Target',
		'num': 543,
		'gen': 5,
		'desc': 'The holder\'s type immunities granted solely by its typing are negated.'
	},
	'rockgem': {
		'id': 'rockgem',
		'name': 'Rock Gem',
		'num': 559,
		'gen': 5,
		'desc': 'Holder\'s first successful Rock-type attack will have 1.3x power. Single use.'
	},
	'rockincense': {
		'id': 'rockincense',
		'name': 'Rock Incense',
		'num': 315,
		'gen': 4,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power.'
	},
	'rockmemory': {
		'id': 'rockmemory',
		'name': 'Rock Memory',
		'num': 908,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Rock type.'
	},
	'rockiumz': {
		'id': 'rockiumz',
		'name': 'Rockium Z',
		'num': 788,
		'gen': 7,
		'desc': 'If holder has a Rock move, this item allows it to use a Rock Z-Move.'
	},
	'rockyhelmet': {
		'id': 'rockyhelmet',
		'name': 'Rocky Helmet',
		'num': 540,
		'gen': 5,
		'desc': 'If holder is hit by a contact move, the attacker loses 1/6 of its max HP.'
	},
	'rootfossil': {
		'id': 'rootfossil',
		'name': 'Root Fossil',
		'num': 99,
		'gen': 3,
		'desc': 'Can be revived into Lileep.'
	},
	'roseincense': {
		'id': 'roseincense',
		'name': 'Rose Incense',
		'num': 318,
		'gen': 4,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power.'
	},
	'roseliberry': {
		'id': 'roseliberry',
		'name': 'Roseli Berry',
		'num': 686,
		'gen': 6,
		'desc': 'Halves damage taken from a supereffective Fairy-type attack. Single use.'
	},
	'rowapberry': {
		'id': 'rowapberry',
		'name': 'Rowap Berry',
		'num': 212,
		'gen': 4,
		'desc': 'If holder is hit by a special move, attacker loses 1/8 of its max HP. Single use.'
	},
	'sablenite': {
		'id': 'sablenite',
		'name': 'Sablenite',
		'num': 754,
		'gen': 6,
		'desc': 'If holder is a Sableye, this item allows it to Mega Evolve in battle.'
	},
	'safariball': {
		'id': 'safariball',
		'name': 'Safari Ball',
		'num': 5,
		'gen': 1,
		'desc': 'A special Poke Ball that is used only in the Safari Zone and Great Marsh.'
	},
	'safetygoggles': {
		'id': 'safetygoggles',
		'name': 'Safety Goggles',
		'num': 650,
		'gen': 6,
		'desc': 'Holder is immune to powder moves and damage from Sandstorm or Hail.'
	},
	'salacberry': {
		'id': 'salacberry',
		'name': 'Salac Berry',
		'num': 203,
		'gen': 3,
		'desc': 'Raises holder\'s Speed by 1 stage when at 1/4 max HP or less. Single use.'
	},
	'salamencite': {
		'id': 'salamencite',
		'name': 'Salamencite',
		'num': 769,
		'gen': 6,
		'desc': 'If holder is a Salamence, this item allows it to Mega Evolve in battle.'
	},
	'sceptilite': {
		'id': 'sceptilite',
		'name': 'Sceptilite',
		'num': 753,
		'gen': 6,
		'desc': 'If holder is a Sceptile, this item allows it to Mega Evolve in battle.'
	},
	'scizorite': {
		'id': 'scizorite',
		'name': 'Scizorite',
		'num': 670,
		'gen': 6,
		'desc': 'If holder is a Scizor, this item allows it to Mega Evolve in battle.'
	},
	'scopelens': {
		'id': 'scopelens',
		'name': 'Scope Lens',
		'num': 232,
		'gen': 2,
		'desc': 'Holder\'s critical hit ratio is raised by 1 stage.'
	},
	'seaincense': {
		'id': 'seaincense',
		'name': 'Sea Incense',
		'num': 254,
		'gen': 3,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	'sharpbeak': {
		'id': 'sharpbeak',
		'name': 'Sharp Beak',
		'num': 244,
		'gen': 2,
		'desc': 'Holder\'s Flying-type attacks have 1.2x power.'
	},
	'sharpedonite': {
		'id': 'sharpedonite',
		'name': 'Sharpedonite',
		'num': 759,
		'gen': 6,
		'desc': 'If holder is a Sharpedo, this item allows it to Mega Evolve in battle.'
	},
	'shedshell': {
		'id': 'shedshell',
		'name': 'Shed Shell',
		'num': 295,
		'gen': 4,
		'desc': 'Holder may switch out even when trapped by another Pokemon, or by Ingrain.'
	},
	'shellbell': {
		'id': 'shellbell',
		'name': 'Shell Bell',
		'num': 253,
		'gen': 3,
		'desc': 'After an attack, holder gains 1/8 of the damage in HP dealt to other Pokemon.'
	},
	'shockdrive': {
		'id': 'shockdrive',
		'name': 'Shock Drive',
		'num': 117,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Electric type.'
	},
	'shucaberry': {
		'id': 'shucaberry',
		'name': 'Shuca Berry',
		'num': 191,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ground-type attack. Single use.'
	},
	'silkscarf': {
		'id': 'silkscarf',
		'name': 'Silk Scarf',
		'num': 251,
		'gen': 3,
		'desc': 'Holder\'s Normal-type attacks have 1.2x power.'
	},
	'silverpowder': {
		'id': 'silverpowder',
		'name': 'SilverPowder',
		'num': 222,
		'gen': 2,
		'desc': 'Holder\'s Bug-type attacks have 1.2x power.'
	},
	'sitrusberry': {
		'id': 'sitrusberry',
		'name': 'Sitrus Berry',
		'num': 158,
		'gen': 3,
		'desc': 'Restores 1/4 max HP when at 1/2 max HP or less. Single use.'
	},
	'skullfossil': {
		'id': 'skullfossil',
		'name': 'Skull Fossil',
		'num': 105,
		'gen': 4,
		'desc': 'Can be revived into Cranidos.'
	},
	'skyplate': {
		'id': 'skyplate',
		'name': 'Sky Plate',
		'num': 306,
		'gen': 4,
		'desc': 'Holder\'s Flying-type attacks have 1.2x power. Judgment is Flying type.'
	},
	'slowbronite': {
		'id': 'slowbronite',
		'name': 'Slowbronite',
		'num': 760,
		'gen': 6,
		'desc': 'If holder is a Slowbro, this item allows it to Mega Evolve in battle.'
	},
	'smoothrock': {
		'id': 'smoothrock',
		'name': 'Smooth Rock',
		'num': 283,
		'gen': 4,
		'desc': 'Holder\'s use of Sandstorm lasts 8 turns instead of 5.'
	},
	'snorliumz': {
		'id': 'snorliumz',
		'name': 'Snorlium Z',
		'num': 804,
		'gen': 7,
		'desc': 'If holder is a Snorlax with Giga Impact, it can use Pulverizing Pancake.'
	},
	'snowball': {
		'id': 'snowball',
		'name': 'Snowball',
		'num': 649,
		'gen': 6,
		'desc': 'Raises holder\'s Attack by 1 if hit by an Ice-type attack. Single use.'
	},
	'softsand': {
		'id': 'softsand',
		'name': 'Soft Sand',
		'num': 237,
		'gen': 2,
		'desc': 'Holder\'s Ground-type attacks have 1.2x power.'
	},
	'souldew': {
		'id': 'souldew',
		'name': 'Soul Dew',
		'num': 225,
		'gen': 3,
		'desc': 'If holder\'s a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.'
	},
	'spelltag': {
		'id': 'spelltag',
		'name': 'Spell Tag',
		'num': 247,
		'gen': 2,
		'desc': 'Holder\'s Ghost-type attacks have 1.2x power.'
	},
	'spelonberry': {
		'id': 'spelonberry',
		'name': 'Spelon Berry',
	
		'num': 179,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'splashplate': {
		'id': 'splashplate',
		'name': 'Splash Plate',
		'num': 299,
		'gen': 4,
		'desc': 'Holder\'s Water-type attacks have 1.2x power. Judgment is Water type.'
	},
	'spookyplate': {
		'id': 'spookyplate',
		'name': 'Spooky Plate',
		'num': 310,
		'gen': 4,
		'desc': 'Holder\'s Ghost-type attacks have 1.2x power. Judgment is Ghost type.'
	},
	'sportball': {
		'id': 'sportball',
		'name': 'Sport Ball',
		'num': 499,
		'gen': 2,
		'desc': 'A special Poke Ball for the Bug-Catching Contest.'
	},
	'starfberry': {
		'id': 'starfberry',
		'name': 'Starf Berry',
		'num': 207,
		'gen': 3,
		'desc': 'Raises a random stat by 2 when at 1/4 max HP or less (not acc/eva). Single use.'
	},
	'steelixite': {
		'id': 'steelixite',
		'name': 'Steelixite',
		'num': 761,
		'gen': 6,
		'desc': 'If holder is a Steelix, this item allows it to Mega Evolve in battle.'
	},
	'steelgem': {
		'id': 'steelgem',
		'name': 'Steel Gem',
		'num': 563,
		'gen': 5,
		'desc': 'Holder\'s first successful Steel-type attack will have 1.3x power. Single use.'
	},
	'steelmemory': {
		'id': 'steelmemory',
		'name': 'Steel Memory',
		'num': 911,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Steel type.'
	},
	'steeliumz': {
		'id': 'steeliumz',
		'name': 'Steelium Z',
		'num': 792,
		'gen': 7,
		'desc': 'If holder has a Steel move, this item allows it to use a Steel Z-Move.'
	},
	'stick': {
		'id': 'stick',
		'name': 'Stick',
		'num': 259,
		'gen': 2,
		'desc': 'If holder is a Farfetch\'d, its critical hit ratio is raised by 2 stages.'
	},
	'stickybarb': {
		'id': 'stickybarb',
		'name': 'Sticky Barb',
		'num': 288,
		'gen': 4,
		'desc': 'Each turn, holder loses 1/8 max HP. An attacker making contact can receive it.'
	},
	'stoneplate': {
		'id': 'stoneplate',
		'name': 'Stone Plate',
		'num': 309,
		'gen': 4,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power. Judgment is Rock type.'
	},
	'swampertite': {
		'id': 'swampertite',
		'name': 'Swampertite',
		'num': 752,
		'gen': 6,
		'desc': 'If holder is a Swampert, this item allows it to Mega Evolve in battle.'
	},
	'tamatoberry': {
		'id': 'tamatoberry',
		'name': 'Tamato Berry',
		'num': 174,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'tangaberry': {
		'id': 'tangaberry',
		'name': 'Tanga Berry',
		'num': 194,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Bug-type attack. Single use.'
	},
	'tapuniumz': {
		'id': 'tapuniumz',
		'name': 'Tapunium Z',
		'num': 801,
		'gen': 7,
		'desc': 'If holder is a Tapu with Nature\'s Madness, it can use Guardian of Alola.'
	},
	'terrainextender': {
		'id': 'terrainextender',
		'name': 'Terrain Extender',
		'num': 879,
		'gen': 7,
		'desc': 'Holder\'s use of Electric/Grassy/Misty/Psychic Terrain lasts 8 turns instead of 5.'
	},
	'thickclub': {
		'id': 'thickclub',
		'name': 'Thick Club',
		'num': 258,
		'gen': 2,
		'desc': 'If holder is a Cubone or a Marowak, its Attack is doubled.'
	},
	'timerball': {
		'id': 'timerball',
		'name': 'Timer Ball',
		'num': 10,
		'gen': 3,
		'desc': 'A Poke Ball that becomes better the more turns there are in a battle.'
	},
	'toxicorb': {
		'id': 'toxicorb',
		'name': 'Toxic Orb',
		'num': 272,
		'gen': 4,
		'desc': 'At the end of every turn, this item attempts to badly poison the holder.'
	},
	'toxicplate': {
		'id': 'toxicplate',
		'name': 'Toxic Plate',
		'num': 304,
		'gen': 4,
		'desc': 'Holder\'s Poison-type attacks have 1.2x power. Judgment is Poison type.'
	},
	'twistedspoon': {
		'id': 'twistedspoon',
		'name': 'TwistedSpoon',
		'num': 248,
		'gen': 2,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power.'
	},
	'tyranitarite': {
		'id': 'tyranitarite',
		'name': 'Tyranitarite',
		'num': 669,
		'gen': 6,
		'desc': 'If holder is a Tyranitar, this item allows it to Mega Evolve in battle.'
	},
	'ultraball': {
		'id': 'ultraball',
		'name': 'Ultra Ball',
		'num': 2,
		'gen': 1,
		'desc': 'An ultra-performance Ball that provides a higher catch rate than a Great Ball.'
	},
	'venusaurite': {
		'id': 'venusaurite',
		'name': 'Venusaurite',
		'num': 659,
		'gen': 6,
		'desc': 'If holder is a Venusaur, this item allows it to Mega Evolve in battle.'
	},
	'wacanberry': {
		'id': 'wacanberry',
		'name': 'Wacan Berry',
		'num': 186,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Electric-type attack. Single use.'
	},
	'watergem': {
		'id': 'watergem',
		'name': 'Water Gem',
		'num': 549,
		'gen': 5,
		'desc': 'Holder\'s first successful Water-type attack will have 1.3x power. Single use.'
	},
	'watermemory': {
		'id': 'watermemory',
		'name': 'Water Memory',
		'num': 913,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Water type.'
	},
	'wateriumz': {
		'id': 'wateriumz',
		'name': 'Waterium Z',
		'num': 778,
		'gen': 7,
		'desc': 'If holder has a Water move, this item allows it to use a Water Z-Move.'
	},
	'watmelberry': {
		'id': 'watmelberry',
		'name': 'Watmel Berry',
	
		'num': 181,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'waveincense': {
		'id': 'waveincense',
		'name': 'Wave Incense',
		'num': 317,
		'gen': 4,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	'weaknesspolicy': {
		'id': 'weaknesspolicy',
		'name': 'Weakness Policy',
		'num': 639,
		'gen': 6,
		'desc': 'If holder is hit super effectively, raises Attack, Sp. Atk by 2 stages. Single use.'
	},
	'wepearberry': {
		'id': 'wepearberry',
		'name': 'Wepear Berry',
	
		'num': 167,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	'whiteherb': {
		'id': 'whiteherb',
		'name': 'White Herb',
		'num': 214,
		'gen': 3,
		'desc': 'Restores all lowered stat stages to 0 when one is less than 0. Single use.'
	},
	'widelens': {
		'id': 'widelens',
		'name': 'Wide Lens',
		'num': 265,
		'gen': 4,
		'desc': 'The accuracy of attacks by the holder is 1.1x.'
	},
	'wikiberry': {
		'id': 'wikiberry',
		'name': 'Wiki Berry',
		'num': 160,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.'
	},
	'wiseglasses': {
		'id': 'wiseglasses',
		'name': 'Wise Glasses',
		'num': 267,
		'gen': 4,
		'desc': 'Holder\'s special attacks have 1.1x power.'
	},
	'yacheberry': {
		'id': 'yacheberry',
		'name': 'Yache Berry',
		'num': 188,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ice-type attack. Single use.'
	},
	'zapplate': {
		'id': 'zapplate',
		'name': 'Zap Plate',
		'num': 300,
		'gen': 4,
		'desc': 'Holder\'s Electric-type attacks have 1.2x power. Judgment is Electric type.'
	},
	'zoomlens': {
		'id': 'zoomlens',
		'name': 'Zoom Lens',
		'num': 276,
		'gen': 4,
		'desc': 'The accuracy of attacks by the holder is 1.2x if it moves after its target.'
	},
	'berserkgene': {
		'id': 'berserkgene',
		'name': 'Berserk Gene',
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) On switch-in, raises holder\'s Attack by 2 and confuses it. Single use.'
	},
	'berry': {
		'id': 'berry',
		'name': 'Berry',
		'num': 155,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 10 HP when at 1/2 max HP or less. Single use.'
	},
	'bitterberry': {
		'id': 'bitterberry',
		'name': 'Bitter Berry',
		'num': 156,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is confused. Single use.'
	},
	'burntberry': {
		'id': 'burntberry',
		'name': 'Burnt Berry',
		'num': 153,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is frozen. Single use.'
	},
	'dragonscale': {
		'id': 'dragonscale',
		'name': 'Dragon Scale',
		'num': 250,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Dragon-type attacks have 1.1x power. Evolves Seadra (trade).'
	},
	'goldberry': {
		'id': 'goldberry',
		'name': 'Gold Berry',
		'num': 158,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 30 HP when at 1/2 max HP or less. Single use.'
	},
	'iceberry': {
		'id': 'iceberry',
		'name': 'Ice Berry',
		'num': 152,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is burned. Single use.'
	},
	'mintberry': {
		'id': 'mintberry',
		'name': 'Mint Berry',
		'num': 150,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder wakes up if it is asleep. Single use.'
	},
	'miracleberry': {
		'id': 'miracleberry',
		'name': 'Miracle Berry',
		'num': 157,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder cures itself if it is confused or has a status condition. Single use.'
	},
	'mysteryberry': {
		'id': 'mysteryberry',
		'name': 'Mystery Berry',
		'num': 154,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 5 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
	},
	'pinkbow': {
		'id': 'pinkbow',
		'name': 'Pink Bow',
		'num': 251,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
	},
	'polkadotbow': {
		'id': 'polkadotbow',
		'name': 'Polkadot Bow',
		'num': 251,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
	},
	'przcureberry': {
		'id': 'przcureberry',
		'name': 'PRZ Cure Berry',
		'num': 149,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder cures itself if it is paralyzed. Single use.'
	},
	'psncureberry': {
		'id': 'psncureberry',
		'name': 'PSN Cure Berry',
		'num': 151,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is poisoned. Single use.'
	},
	'crucibellite': {
		'id': 'crucibellite',
		'name': 'Crucibellite',
		'num': -1,
		'gen': 6,
		'desc': 'If holder is a Crucibelle, this item allows it to Mega Evolve in battle.'
	}
};

module.exports = {BattleItems};