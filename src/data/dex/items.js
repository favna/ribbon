const BattleItems = [
  {
    id: 'abomasite',
    name: 'Abomasite',
    num: 674,
    gen: 6,
    desc: 'If held by an Abomasnow, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'absolite',
    name: 'Absolite',
    num: 677,
    gen: 6,
    desc: 'If held by an Absol, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'absorbbulb',
    name: 'Absorb Bulb',
    desc: 'Raises holder\'s Sp. Atk by 1 stage if hit by a Water-type attack. Single use.'
  },
  {
    id: 'adamantorb',
    name: 'Adamant Orb',
    desc: 'If held by a Dialga, its Steel- and Dragon-type attacks have 1.2x power.'
  },
  {
    id: 'adrenalineorb',
    name: 'Adrenaline Orb',
    desc: 'Raises holder\'s Speed by 1 stage if it gets affected by Intimidate. Single use.'
  },
  {
    id: 'aerodactylite',
    name: 'Aerodactylite',
    num: 672,
    gen: 6,
    desc: 'If held by an Aerodactyl, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'aggronite',
    name: 'Aggronite',
    num: 667,
    gen: 6,
    desc: 'If held by an Aggron, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'aguavberry',
    name: 'Aguav Berry',
    gen: 3,
    desc: 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.'
  },
  {
    id: 'airballoon',
    name: 'Air Balloon',
    num: 541,
    gen: 5,
    desc: 'Holder is immune to Ground-type attacks. Pops when holder is hit.'
  },
  {
    id: 'alakazite',
    name: 'Alakazite',
    num: 679,
    gen: 6,
    desc: 'If held by an Alakazam, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'aloraichiumz',
    name: 'Aloraichium Z',
    num: 803,
    gen: 7,
    desc: 'If held by an Alolan Raichu with Thunderbolt, it can use Stoked Sparksurfer.'
  },
  {
    id: 'altarianite',
    name: 'Altarianite',
    num: 755,
    gen: 6,
    desc: 'If held by an Altaria, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'ampharosite',
    name: 'Ampharosite',
    num: 658,
    gen: 6,
    desc: 'If held by an Ampharos, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'apicotberry',
    name: 'Apicot Berry',
    num: 205,
    gen: 3,
    desc: 'Raises holder\'s Sp. Def by 1 stage when at 1/4 max HP or less. Single use.'
  },
  {
    id: 'armorfossil',
    name: 'Armor Fossil',
    num: 104,
    gen: 4,
    desc: 'Can be revived into Shieldon.'
  },
  {
    id: 'aspearberry',
    name: 'Aspear Berry',
    num: 153,
    gen: 3,
    desc: 'Holder is cured if it is frozen. Single use.'
  },
  {
    id: 'assaultvest',
    name: 'Assault Vest',
    num: 640,
    gen: 6,
    desc: 'Holder\'s Sp. Def is 1.5x, but it can only select damaging moves.'
  },
  {
    id: 'audinite',
    name: 'Audinite',
    num: 757,
    gen: 6,
    desc: 'If held by an Audino, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'babiriberry',
    name: 'Babiri Berry',
    num: 199,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Steel-type attack. Single use.'
  },
  {
    id: 'banettite',
    name: 'Banettite',
    num: 668,
    gen: 6,
    desc: 'If held by a Banette, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'beastball',
    name: 'Beast Ball',
    num: 851,
    gen: 7,
    desc: 'A special Poke Ball designed to catch Ultra Beasts.'
  },
  {
    id: 'beedrillite',
    name: 'Beedrillite',
    num: 770,
    gen: 6,
    desc: 'If held by a Beedrill, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'belueberry',
    name: 'Belue Berry'
  },
  {
    id: 'berryjuice',
    name: 'Berry Juice',
    num: 43,
    gen: 2,
    desc: 'Restores 20 HP when at 1/2 max HP or less. Single use.'
  },
  {
    id: 'bigroot',
    name: 'Big Root',
    num: 296,
    gen: 4,
    desc: 'Holder gains 1.3x HP from draining/Aqua Ring/Ingrain/Leech Seed/Strength Sap.'
  },
  {
    id: 'bindingband',
    name: 'Binding Band',
    num: 544,
    gen: 5,
    desc: 'Holder\'s partial-trapping moves deal 1/6 max HP per turn instead of 1/8.'
  },
  {
    id: 'blackbelt',
    name: 'Black Belt',
    desc: 'Holder\'s Fighting-type attacks have 1.2x power.'
  },
  {
    id: 'blacksludge',
    name: 'Black Sludge',
    num: 281,
    gen: 4,
    desc: 'Each turn, if holder is a Poison type, restores 1/16 max HP; loses 1/8 if not.'
  },
  {
    id: 'blackglasses',
    name: 'Black Glasses',
    desc: 'Holder\'s Dark-type attacks have 1.2x power.'
  },
  {
    id: 'blastoisinite',
    name: 'Blastoisinite',
    num: 661,
    gen: 6,
    desc: 'If held by a Blastoise, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'blazikenite',
    name: 'Blazikenite',
    num: 664,
    gen: 6,
    desc: 'If held by a Blaziken, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'blueorb',
    name: 'Blue Orb',
    num: 535,
    gen: 6,
    desc: 'If held by a Kyogre, this item triggers its Primal Reversion in battle.'
  },
  {
    id: 'blukberry',
    name: 'Bluk Berry'
  },
  {
    id: 'brightpowder',
    name: 'BrightPowder',
    num: 213,
    gen: 2,
    desc: 'The accuracy of attacks against the holder is 0.9x.'
  },
  {
    id: 'buggem',
    name: 'Bug Gem',
    num: 558,
    gen: 5,
    desc: 'Holder\'s first successful Bug-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'bugmemory',
    name: 'Bug Memory',
    num: 909,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Bug type.'
  },
  {
    id: 'buginiumz',
    name: 'Buginium Z',
    num: 787,
    gen: 7,
    desc: 'If holder has a Bug move, this item allows it to use a Bug Z-Move.'
  },
  {
    id: 'burndrive',
    name: 'Burn Drive',
    num: 118,
    gen: 5,
    desc: 'Holder\'s Techno Blast is Fire type.'
  },
  {
    id: 'cameruptite',
    name: 'Cameruptite',
    num: 767,
    gen: 6,
    desc: 'If held by a Camerupt, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'cellbattery',
    name: 'Cell Battery',
    desc: 'Raises holder\'s Attack by 1 if hit by an Electric-type attack. Single use.'
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    desc: 'Holder\'s Fire-type attacks have 1.2x power.'
  },
  {
    id: 'charizarditex',
    name: 'Charizardite X',
    num: 660,
    gen: 6,
    desc: 'If held by a Charizard, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'charizarditey',
    name: 'Charizardite Y',
    num: 678,
    gen: 6,
    desc: 'If held by a Charizard, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'chartiberry',
    name: 'Charti Berry',
    num: 195,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Rock-type attack. Single use.'
  },
  {
    id: 'cheriberry',
    name: 'Cheri Berry',
    num: 149,
    gen: 3,
    desc: 'Holder cures itself if it is paralyzed. Single use.'
  },
  {
    id: 'cherishball',
    name: 'Cherish Ball',
    num: 16,
    gen: 4,
    desc: 'A rare Poke Ball that has been crafted to commemorate an occasion.'
  },
  {
    id: 'chestoberry',
    name: 'Chesto Berry',
    num: 150,
    gen: 3,
    desc: 'Holder wakes up if it is asleep. Single use.'
  },
  {
    id: 'chilanberry',
    name: 'Chilan Berry',
    num: 200,
    gen: 4,
    desc: 'Halves damage taken from a Normal-type attack. Single use.'
  },
  {
    id: 'chilldrive',
    name: 'Chill Drive',
    num: 119,
    gen: 5,
    desc: 'Holder\'s Techno Blast is Ice type.'
  },
  {
    id: 'choiceband',
    name: 'Choice Band',
    num: 220,
    gen: 3,
    desc: 'Holder\'s Attack is 1.5x, but it can only select the first move it executes.'
  },
  {
    id: 'choicescarf',
    name: 'Choice Scarf',
    num: 287,
    gen: 4,
    desc: 'Holder\'s Speed is 1.5x, but it can only select the first move it executes.'
  },
  {
    id: 'choicespecs',
    name: 'Choice Specs',
    num: 297,
    gen: 4,
    desc: 'Holder\'s Sp. Atk is 1.5x, but it can only select the first move it executes.'
  },
  {
    id: 'chopleberry',
    name: 'Chople Berry',
    num: 189,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Fighting-type attack. Single use.'
  },
  {
    id: 'clawfossil',
    name: 'Claw Fossil',
    num: 100,
    gen: 3,
    desc: 'Can be revived into Anorith.'
  },
  {
    id: 'cobaberry',
    name: 'Coba Berry',
    num: 192,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Flying-type attack. Single use.'
  },
  {
    id: 'colburberry',
    name: 'Colbur Berry',
    num: 198,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Dark-type attack. Single use.'
  },
  {
    id: 'cornnberry',
    name: 'Cornn Berry',
    num: 175,
    gen: 3,
    desc: 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
  },
  {
    id: 'coverfossil',
    name: 'Cover Fossil',
    num: 572,
    gen: 5,
    desc: 'Can be revived into Tirtouga.'
  },
  {
    id: 'custapberry',
    name: 'Custap Berry',
    num: 210,
    gen: 4,
    desc: 'Holder moves first in its priority bracket when at 1/4 max HP or less. Single use.'
  },
  {
    id: 'damprock',
    name: 'Damp Rock',
    num: 285,
    gen: 4,
    desc: 'Holder\'s use of Rain Dance lasts 8 turns instead of 5.'
  },
  {
    id: 'darkgem',
    name: 'Dark Gem',
    num: 562,
    gen: 5,
    desc: 'Holder\'s first successful Dark-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'darkmemory',
    name: 'Dark Memory',
    num: 919,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Dark type.'
  },
  {
    id: 'darkiniumz',
    name: 'Darkinium Z',
    num: 791,
    gen: 7,
    desc: 'If holder has a Dark move, this item allows it to use a Dark Z-Move.'
  },
  {
    id: 'dawnstone',
    name: 'Dawn Stone',
    num: 109,
    gen: 4,
    desc: 'Evolves male Kirlia into Gallade and female Snorunt into Froslass when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'decidiumz',
    name: 'Decidium Z',
    num: 798,
    gen: 7,
    desc: 'If held by a Decidueye with Spirit Shackle, it can use Sinister Arrow Raid.'
  },
  {
    id: 'deepseascale',
    name: 'Deep Sea Scale',
    desc: 'If held by a Clamperl, its Sp. Def is doubled. Evolves Clamperl into Gorebyss when traded.',
    shortDesc: 'If held by a Clamperl, its Sp. Def is doubled.'
  },
  {
    id: 'deepseatooth',
    name: 'Deep Sea Tooth',
    desc: 'If held by a Clamperl, its Sp. Atk is doubled. Evolves Clamperl into Huntail when traded.',
    shortDesc: 'If held by a Clamperl, its Sp. Atk is doubled.'
  },
  {
    id: 'destinyknot',
    name: 'Destiny Knot',
    num: 280,
    gen: 4,
    desc: 'If holder becomes infatuated, the other Pokemon also becomes infatuated.'
  },
  {
    id: 'diancite',
    name: 'Diancite',
    num: 764,
    gen: 6,
    desc: 'If held by a Diancie, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'diveball',
    name: 'Dive Ball',
    num: 7,
    gen: 3,
    desc: 'A Poke Ball that works especially well on Pokemon that live underwater.'
  },
  {
    id: 'domefossil',
    name: 'Dome Fossil',
    num: 102,
    gen: 3,
    desc: 'Can be revived into Kabuto.'
  },
  {
    id: 'dousedrive',
    name: 'Douse Drive',
    num: 116,
    gen: 5,
    desc: 'Holder\'s Techno Blast is Water type.'
  },
  {
    id: 'dracoplate',
    name: 'Draco Plate',
    num: 311,
    gen: 4,
    desc: 'Holder\'s Dragon-type attacks have 1.2x power. Judgment is Dragon type.'
  },
  {
    id: 'dragonfang',
    name: 'Dragon Fang',
    desc: 'Holder\'s Dragon-type attacks have 1.2x power.'
  },
  {
    id: 'dragongem',
    name: 'Dragon Gem',
    num: 561,
    gen: 5,
    desc: 'Holder\'s first successful Dragon-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'dragonmemory',
    name: 'Dragon Memory',
    num: 918,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Dragon type.'
  },
  {
    id: 'dragonscale',
    name: 'Dragon Scale',
    num: 250,
    gen: 2,
    desc: 'Evolves Seadra into Kingdra when traded.'
  },
  {
    id: 'dragoniumz',
    name: 'Dragonium Z',
    num: 790,
    gen: 7,
    desc: 'If holder has a Dragon move, this item allows it to use a Dragon Z-Move.'
  },
  {
    id: 'dreadplate',
    name: 'Dread Plate',
    num: 312,
    gen: 4,
    desc: 'Holder\'s Dark-type attacks have 1.2x power. Judgment is Dark type.'
  },
  {
    id: 'dreamball',
    name: 'Dream Ball',
    num: 576,
    gen: 5,
    desc: 'A special Poke Ball that appears out of nowhere in a bag at the Entree Forest.'
  },
  {
    id: 'dubiousdisc',
    name: 'Dubious Disc',
    num: 324,
    gen: 4,
    desc: 'Evolves Porygon2 into Porygon-Z when traded.'
  },
  {
    id: 'durinberry',
    name: 'Durin Berry'
  },
  {
    id: 'duskball',
    name: 'Dusk Ball',
    num: 13,
    gen: 4,
    desc: 'A Poke Ball that makes it easier to catch wild Pokemon at night or in caves.'
  },
  {
    id: 'duskstone',
    name: 'Dusk Stone',
    num: 108,
    gen: 4,
    desc: 'Evolves Murkrow into Honchkrow, Misdreavus into Mismagius, Lampent into Chandelure, and Doublade into Aegislash when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'earthplate',
    name: 'Earth Plate',
    num: 305,
    gen: 4,
    desc: 'Holder\'s Ground-type attacks have 1.2x power. Judgment is Ground type.'
  },
  {
    id: 'eeviumz',
    name: 'Eevium Z',
    num: 805,
    gen: 7,
    desc: 'If held by an Eevee with Last Resort, it can use Extreme Evoboost.'
  },
  {
    id: 'ejectbutton',
    name: 'Eject Button',
    num: 547,
    gen: 5,
    desc: 'If holder survives a hit, it immediately switches out to a chosen ally. Single use.'
  },
  {
    id: 'electirizer',
    name: 'Electirizer',
    num: 322,
    gen: 4,
    desc: 'Evolves Electabuzz into Electivire when traded.'
  },
  {
    id: 'electricgem',
    name: 'Electric Gem',
    num: 550,
    gen: 5,
    desc: 'Holder\'s first successful Electric-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'electricmemory',
    name: 'Electric Memory',
    num: 915,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Electric type.'
  },
  {
    id: 'electricseed',
    name: 'Electric Seed',
    desc: 'If the terrain is Electric Terrain, raises holder\'s Defense by 1 stage. Single use.'
  },
  {
    id: 'electriumz',
    name: 'Electrium Z',
    num: 779,
    gen: 7,
    desc: 'If holder has an Electric move, this item allows it to use an Electric Z-Move.'
  },
  {
    id: 'energypowder',
    name: 'Energy Powder',
    num: 34,
    gen: 2,
    desc: 'Restores 50 HP to one Pokemon but lowers Happiness.'
  },
  {
    id: 'enigmaberry',
    name: 'Enigma Berry'
  }, {
    id: 'eviolite',
    name: 'Eviolite',
    num: 538,
    gen: 5,
    desc: 'If holder\'s species can evolve, its Defense and Sp. Def are 1.5x.'
  },
  {
    id: 'expertbelt',
    name: 'Expert Belt',
    desc: 'Holder\'s attacks that are super effective against the target do 1.2x damage.'
  },
  {
    id: 'fairiumz',
    name: 'Fairium Z',
    num: 793,
    gen: 7,
    desc: 'If holder has a Fairy move, this item allows it to use a Fairy Z-Move.'
  },
  {
    id: 'fairygem',
    name: 'Fairy Gem',
    num: 715,
    gen: 6,
    desc: 'Holder\'s first successful Fairy-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'fairymemory',
    name: 'Fairy Memory',
    num: 920,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Fairy type.'
  },
  {
    id: 'fastball',
    name: 'Fast Ball',
    num: 492,
    gen: 2,
    desc: 'A Poke Ball that makes it easier to catch Pokemon which are quick to run away.'
  },
  {
    id: 'fightinggem',
    name: 'Fighting Gem',
    num: 553,
    gen: 5,
    desc: 'Holder\'s first successful Fighting-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'fightingmemory',
    name: 'Fighting Memory',
    num: 904,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Fighting type.'
  },
  {
    id: 'fightiniumz',
    name: 'Fightinium Z',
    num: 782,
    gen: 7,
    desc: 'If holder has a Fighting move, this item allows it to use a Fighting Z-Move.'
  },
  {
    id: 'figyberry',
    name: 'Figy Berry',
    gen: 3,
    desc: 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.'
  },
  {
    id: 'firegem',
    name: 'Fire Gem',
    num: 548,
    gen: 5,
    desc: 'Holder\'s first successful Fire-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'firememory',
    name: 'Fire Memory',
    num: 912,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Fire type.'
  },
  {
    id: 'firestone',
    name: 'Fire Stone',
    num: 82,
    gen: 1,
    desc: 'Evolves Vulpix into Ninetales, Growlithe into Arcanine, Eevee into Flareon, and Pansear into Simisear when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'firiumz',
    name: 'Firium Z',
    num: 777,
    gen: 7,
    desc: 'If holder has a Fire move, this item allows it to use a Fire Z-Move.'
  },
  {
    id: 'fistplate',
    name: 'Fist Plate',
    num: 303,
    gen: 4,
    desc: 'Holder\'s Fighting-type attacks have 1.2x power. Judgment is Fighting type.'
  },
  {
    id: 'flameorb',
    name: 'Flame Orb'
  },
  {
    id: 'flameplate',
    name: 'Flame Plate',
    num: 298,
    gen: 4,
    desc: 'Holder\'s Fire-type attacks have 1.2x power. Judgment is Fire type.'
  },
  {
    id: 'floatstone',
    name: 'Float Stone',
    spritenum: 147
  },
  {
    id: 'flyinggem',
    name: 'Flying Gem',
    num: 556,
    gen: 5,
    desc: 'Holder\'s first successful Flying-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'flyingmemory',
    name: 'Flying Memory',
    num: 905,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Flying type.'
  },
  {
    id: 'flyiniumz',
    name: 'Flyinium Z',
    num: 785,
    gen: 7,
    desc: 'If holder has a Flying move, this item allows it to use a Flying Z-Move.'
  },
  {
    id: 'focusband',
    name: 'Focus Band',
    num: 230,
    gen: 2,
    desc: 'Holder has a 10% chance to survive an attack that would KO it with 1 HP.'
  },
  {
    id: 'focussash',
    name: 'Focus Sash',
    num: 275,
    gen: 4,
    desc: 'If holder\'s HP is full, will survive an attack that would KO it with 1 HP. Single use.'
  },
  {
    id: 'friendball',
    name: 'Friend Ball',
    num: 497,
    gen: 2,
    desc: 'A Poke Ball that makes caught Pokemon more friendly.'
  },
  {
    id: 'fullincense',
    name: 'Full Incense',
    spritenum: 155
  },
  {
    id: 'galladite',
    name: 'Galladite',
    num: 756,
    gen: 6,
    desc: 'If held by a Gallade, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'ganlonberry',
    name: 'Ganlon Berry',
    num: 202,
    gen: 3,
    desc: 'Raises holder\'s Defense by 1 stage when at 1/4 max HP or less. Single use.'
  },
  {
    id: 'garchompite',
    name: 'Garchompite',
    num: 683,
    gen: 6,
    desc: 'If held by a Garchomp, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'gardevoirite',
    name: 'Gardevoirite',
    num: 657,
    gen: 6,
    desc: 'If held by a Gardevoir, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'gengarite',
    name: 'Gengarite',
    num: 656,
    gen: 6,
    desc: 'If held by a Gengar, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'ghostgem',
    name: 'Ghost Gem',
    num: 560,
    gen: 5,
    desc: 'Holder\'s first successful Ghost-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'ghostmemory',
    name: 'Ghost Memory',
    num: 910,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Ghost type.'
  },
  {
    id: 'ghostiumz',
    name: 'Ghostium Z',
    num: 789,
    gen: 7,
    desc: 'If holder has a Ghost move, this item allows it to use a Ghost Z-Move.'
  },
  {
    id: 'glalitite',
    name: 'Glalitite',
    num: 763,
    gen: 6,
    desc: 'If held by a Glalie, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'grassgem',
    name: 'Grass Gem',
    num: 551,
    gen: 5,
    desc: 'Holder\'s first successful Grass-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'grassmemory',
    name: 'Grass Memory',
    num: 914,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Grass type.'
  },
  {
    id: 'grassiumz',
    name: 'Grassium Z',
    num: 780,
    gen: 7,
    desc: 'If holder has a Grass move, this item allows it to use a Grass Z-Move.'
  },
  {
    id: 'grassyseed',
    name: 'Grassy Seed',
    desc: 'If the terrain is Grassy Terrain, raises holder\'s Defense by 1 stage. Single use.'
  },
  {
    id: 'greatball',
    name: 'Great Ball',
    num: 3,
    gen: 1,
    desc: 'A high-performance Ball that provides a higher catch rate than a Poke Ball.'
  },
  {
    id: 'grepaberry',
    name: 'Grepa Berry'
  },
  {
    id: 'gripclaw',
    name: 'Grip Claw',
    num: 286,
    gen: 4,
    desc: 'Holder\'s partial-trapping moves always last 7 turns.'
  },
  {
    id: 'griseousorb',
    name: 'Griseous Orb',
    num: 112,
    gen: 4,
    desc: 'If held by a Giratina, its Ghost- and Dragon-type attacks have 1.2x power.'
  },
  {
    id: 'groundgem',
    name: 'Ground Gem',
    num: 555,
    gen: 5,
    desc: 'Holder\'s first successful Ground-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'groundmemory',
    name: 'Ground Memory',
    num: 907,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Ground type.'
  },
  {
    id: 'groundiumz',
    name: 'Groundium Z',
    num: 784,
    gen: 7,
    desc: 'If holder has a Ground move, this item allows it to use a Ground Z-Move.'
  },
  {
    id: 'gyaradosite',
    name: 'Gyaradosite',
    num: 676,
    gen: 6,
    desc: 'If held by a Gyarados, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'habanberry',
    name: 'Haban Berry',
    num: 197,
    gen: 4,
    desc: 'Halves damage taken from a supereffective Dragon-type attack. Single use.'
  },
  {
    id: 'hardstone',
    name: 'Hard Stone',
    desc: 'Holder\'s Rock-type attacks have 1.2x power.'
  },
  {
    id: 'healball',
    name: 'Heal Ball',
    num: 14,
    gen: 4,
    desc: 'A remedial Poke Ball that restores the caught Pokemon\'s HP and status problem.'
  },
  {
    id: 'heatrock',
    name: 'Heat Rock',
    num: 284,
    gen: 4,
    desc: 'Holder\'s use of Sunny Day lasts 8 turns instead of 5.'
  },
  {
    id: 'heavyball',
    name: 'Heavy Ball',
    num: 495,
    gen: 2,
    desc: 'A Poke Ball for catching very heavy Pokemon.'
  },
  {
    id: 'helixfossil',
    name: 'Helix Fossil',
    num: 101,
    gen: 3,
    desc: 'Can be revived into Omanyte.'
  },
  {
    id: 'heracronite',
    name: 'Heracronite',
    num: 680,
    gen: 6,
    desc: 'If held by a Heracross, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'hondewberry',
    name: 'Hondew Berry'
  },
  {
    id: 'houndoominite',
    name: 'Houndoominite',
    num: 666,
    gen: 6,
    desc: 'If held by a Houndoom, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'iapapaberry',
    name: 'Iapapa Berry',
    gen: 3,
    desc: 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.'
  },
  {
    id: 'icegem',
    name: 'Ice Gem',
    num: 552,
    gen: 5,
    desc: 'Holder\'s first successful Ice-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'icememory',
    name: 'Ice Memory',
    num: 917,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Ice type.'
  },
  {
    id: 'icestone',
    name: 'Ice Stone',
    num: 849,
    gen: 7,
    desc: 'Evolves Alolan Sandshrew into Alolan Sandslash and Alolan Vulpix into Alolan Ninetales when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'icicleplate',
    name: 'Icicle Plate',
    num: 302,
    gen: 4,
    desc: 'Holder\'s Ice-type attacks have 1.2x power. Judgment is Ice type.'
  },
  {
    id: 'iciumz',
    name: 'Icium Z',
    num: 781,
    gen: 7,
    desc: 'If holder has an Ice move, this item allows it to use an Ice Z-Move.'
  },
  {
    id: 'icyrock',
    name: 'Icy Rock',
    num: 282,
    gen: 4,
    desc: 'Holder\'s use of Hail lasts 8 turns instead of 5.'
  },
  {
    id: 'inciniumz',
    name: 'Incinium Z',
    num: 799,
    gen: 7,
    desc: 'If held by an Incineroar with Darkest Lariat, it can use Malicious Moonsault.'
  },
  {
    id: 'insectplate',
    name: 'Insect Plate',
    num: 308,
    gen: 4,
    desc: 'Holder\'s Bug-type attacks have 1.2x power. Judgment is Bug type.'
  },
  {
    id: 'ironball',
    name: 'Iron Ball',
    num: 278,
    gen: 4,
    desc: 'Holder is grounded, Speed halved. If Flying type, takes neutral Ground damage.'
  },
  {
    id: 'ironplate',
    name: 'Iron Plate',
    num: 313,
    gen: 4,
    desc: 'Holder\'s Steel-type attacks have 1.2x power. Judgment is Steel type.'
  },
  {
    id: 'jabocaberry',
    name: 'Jaboca Berry'
  },
  {
    id: 'jawfossil',
    name: 'Jaw Fossil',
    num: 710,
    gen: 6,
    desc: 'Can be revived into Tyrunt.'
  },
  {
    id: 'kasibberry',
    name: 'Kasib Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Ghost-type attack. Single use.'
  },
  {
    id: 'kebiaberry',
    name: 'Kebia Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Poison-type attack. Single use.'
  },
  {
    id: 'keeberry',
    name: 'Kee Berry'
  },
  {
    id: 'kelpsyberry',
    name: 'Kelpsy Berry'
  },
  {
    id: 'kangaskhanite',
    name: 'Kangaskhanite',
    num: 675,
    gen: 6,
    desc: 'If held by a Kangaskhan, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'kingsrock',
    name: 'King\'s Rock',
    num: 221,
    gen: 2,
    desc: 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch. Evolves Poliwhirl into Politoed and Slowpoke into Slowking when traded.',
    shortDesc: 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
  },
  {
    id: 'kommoniumz',
    name: 'Kommonium Z',
    num: 926,
    gen: 7,
    desc: 'If held by a Kommo-o with Clanging Scales, it can use Clangorous Soulblaze.'
  },
  {
    id: 'laggingtail',
    name: 'Lagging Tail',
    spritenum: 237
  },
  {
    id: 'lansatberry',
    name: 'Lansat Berry'
  },
  {
    id: 'latiasite',
    name: 'Latiasite',
    num: 684,
    gen: 6,
    desc: 'If held by a Latias, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'latiosite',
    name: 'Latiosite',
    num: 685,
    gen: 6,
    desc: 'If held by a Latios, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'laxincense',
    name: 'Lax Incense',
    num: 255,
    gen: 3,
    desc: 'The accuracy of attacks against the holder is 0.9x.'
  },
  {
    id: 'leafstone',
    name: 'Leaf Stone',
    num: 85,
    gen: 1,
    desc: 'Evolves Gloom into Vileplume, Weepinbell into Victreebel, Exeggcute into Exeggutor or Alolan Exeggutor, Nuzleaf into Shiftry, and Pansage into Simisage when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'leftovers',
    name: 'Leftovers',
    num: 234,
    gen: 2,
    desc: 'At the end of every turn, holder restores 1/16 of its max HP.'
  },
  {
    id: 'leppaberry',
    name: 'Leppa Berry',
    num: 154,
    gen: 3,
    desc: 'Restores 10 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
  },
  {
    id: 'levelball',
    name: 'Level Ball',
    num: 493,
    gen: 2,
    desc: 'A Poke Ball for catching Pokemon that are a lower level than your own.'
  },
  {
    id: 'liechiberry',
    name: 'Liechi Berry'
  }, {
    id: 'lifeorb',
    name: 'Life Orb',
    num: 270,
    gen: 4,
    desc: 'Holder\'s attacks do 1.3x damage, and it loses 1/10 its max HP after the attack.'
  },
  {
    id: 'lightball',
    name: 'Light Ball',
    num: 236,
    gen: 2,
    desc: 'If held by a Pikachu, its Attack and Sp. Atk are doubled.'
  },
  {
    id: 'lightclay',
    name: 'Light Clay',
    num: 269,
    gen: 4,
    desc: 'Holder\'s use of Aurora Veil, Light Screen, or Reflect lasts 8 turns instead of 5.'
  },
  {
    id: 'lopunnite',
    name: 'Lopunnite',
    num: 768,
    gen: 6,
    desc: 'If held by a Lopunny, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'loveball',
    name: 'Love Ball',
    num: 496,
    gen: 2,
    desc: 'Poke Ball for catching Pokemon that are the opposite gender of your Pokemon.'
  },
  {
    id: 'lucarionite',
    name: 'Lucarionite',
    num: 673,
    gen: 6,
    desc: 'If held by a Lucario, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'luckypunch',
    name: 'Lucky Punch',
    num: 256,
    gen: 2,
    desc: 'If held by a Chansey, its critical hit ratio is raised by 2 stages.'
  },
  {
    id: 'lumberry',
    name: 'Lum Berry'
  }, {
    id: 'luminousmoss',
    name: 'Luminous Moss',
    num: 648,
    gen: 6,
    desc: 'Raises holder\'s Sp. Def by 1 stage if hit by a Water-type attack. Single use.'
  },
  {
    id: 'lunaliumz',
    name: 'Lunalium Z',
    num: 922,
    gen: 7,
    desc: 'Lunala or Dawn Wings Necrozma with Moongeist Beam can use a special Z-Move.'
  },
  {
    id: 'lureball',
    name: 'Lure Ball',
    num: 494,
    gen: 2,
    desc: 'A Poke Ball for catching Pokemon hooked by a Rod when fishing.'
  },
  {
    id: 'lustrousorb',
    name: 'Lustrous Orb',
    num: 136,
    gen: 4,
    desc: 'If held by a Palkia, its Water- and Dragon-type attacks have 1.2x power.'
  },
  {
    id: 'luxuryball',
    name: 'Luxury Ball',
    num: 11,
    gen: 3,
    desc: 'A comfortable Poke Ball that makes a caught wild Pokemon quickly grow friendly.'
  },
  {
    id: 'lycaniumz',
    name: 'Lycanium Z',
    num: 925,
    gen: 7,
    desc: 'If held by a Lycanroc forme with Stone Edge, it can use Splintered Stormshards.'
  },
  {
    id: 'machobrace',
    name: 'Macho Brace',
    num: 215,
    gen: 3,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'magmarizer',
    name: 'Magmarizer',
    num: 323,
    gen: 4,
    desc: 'Evolves Magmar into Magmortar when traded.'
  },
  {
    id: 'magnet',
    name: 'Magnet',
    num: 242,
    gen: 2,
    desc: 'Holder\'s Electric-type attacks have 1.2x power.'
  },
  {
    id: 'magoberry',
    name: 'Mago Berry'
  }, {
    id: 'magostberry',
    name: 'Magost Berry'
  },
  {
    id: 'mail',
    name: 'Mail',
    num: 0,
    gen: 2,
    desc: 'Cannot be given to or taken from a Pokemon, except by Covet/Knock Off/Thief.'
  },
  {
    id: 'manectite',
    name: 'Manectite',
    num: 682,
    gen: 6,
    desc: 'If held by a Manectric, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'marangaberry',
    name: 'Maranga Berry'
  }, {
    id: 'marshadiumz',
    name: 'Marshadium Z',
    zMove: 'Soul-Stealing 7-Star Strike',
    num: 802,
    gen: 7,
    desc: 'If held by Marshadow with Spectral Thief, it can use Soul-Stealing 7-Star Strike.'
  },
  {
    id: 'masterball',
    name: 'Master Ball',
    num: 1,
    gen: 1,
    desc: 'The best Ball with the ultimate performance. It will catch any wild Pokemon.'
  },
  {
    id: 'mawilite',
    name: 'Mawilite',
    num: 681,
    gen: 6,
    desc: 'If held by a Mawile, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'meadowplate',
    name: 'Meadow Plate',
    num: 301,
    gen: 4,
    desc: 'Holder\'s Grass-type attacks have 1.2x power. Judgment is Grass type.'
  },
  {
    id: 'medichamite',
    name: 'Medichamite',
    num: 665,
    gen: 6,
    desc: 'If held by a Medicham, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'mentalherb',
    name: 'Mental Herb',
    num: 219,
    gen: 3,
    desc: 'Cures holder of Attract, Disable, Encore, Heal Block, Taunt, Torment. Single use.'
  },
  {
    id: 'metagrossite',
    name: 'Metagrossite',
    num: 758,
    gen: 6,
    desc: 'If held by a Metagross, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'metalcoat',
    name: 'Metal Coat',
    num: 233,
    gen: 2,
    desc: 'Holder\'s Steel-type attacks have 1.2x power. Evolves Onix into Steelix and Scyther into Scizor when traded.',
    shortDesc: 'Holder\'s Steel-type attacks have 1.2x power.'
  },
  {
    id: 'metalpowder',
    name: 'Metal Powder',
    num: 257,
    gen: 2,
    desc: 'If held by a Ditto that hasn\'t Transformed, its Defense is doubled.'
  },
  {
    id: 'metronome',
    name: 'Metronome',
    num: 277,
    gen: 4,
    desc: 'Damage of moves used on consecutive turns is increased. Max 2x after 5 turns.'
  },
  {
    id: 'mewniumz',
    name: 'Mewnium Z',
    num: 806,
    gen: 7,
    desc: 'If held by a Mew with Psychic, it can use Genesis Supernova.'
  },
  {
    id: 'mewtwonitex',
    name: 'Mewtwonite X',
    num: 662,
    gen: 6,
    desc: 'If held by a Mewtwo, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'mewtwonitey',
    name: 'Mewtwonite Y',
    num: 663,
    gen: 6,
    desc: 'If held by a Mewtwo, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'micleberry',
    name: 'Micle Berry',
    num: 209,
    gen: 4,
    desc: 'Holder\'s next move has 1.2x accuracy when at 1/4 max HP or less. Single use.'
  },
  {
    id: 'mimikiumz',
    name: 'Mimikium Z',
    num: 924,
    gen: 7,
    desc: 'If held by a Mimikyu with Play Rough, it can use Let\'s Snuggle Forever.'
  },
  {
    id: 'mindplate',
    name: 'Mind Plate',
    num: 307,
    gen: 4,
    desc: 'Holder\'s Psychic-type attacks have 1.2x power. Judgment is Psychic type.'
  },
  {
    id: 'miracleseed',
    name: 'Miracle Seed',
    num: 239,
    gen: 2,
    desc: 'Holder\'s Grass-type attacks have 1.2x power.'
  },
  {
    id: 'mistyseed',
    name: 'Misty Seed',
    num: 883,
    gen: 7,
    desc: 'If the terrain is Misty Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
  },
  {
    id: 'moonball',
    name: 'Moon Ball',
    num: 498,
    gen: 2,
    desc: 'A Poke Ball for catching Pokemon that evolve using the Moon Stone.'
  },
  {
    id: 'moonstone',
    name: 'Moon Stone',
    num: 81,
    gen: 1,
    desc: 'Evolves Nidorina into Nidoqueen, Nidorino into Nidoking, Clefairy into Clefable, Jigglypuff into Wigglytuff, Skitty into Delcatty, and Munna into Musharna when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'muscleband',
    name: 'Muscle Band',
    num: 266,
    gen: 4,
    desc: 'Holder\'s physical attacks have 1.1x power.'
  },
  {
    id: 'mysticwater',
    name: 'Mystic Water',
    num: 243,
    gen: 2,
    desc: 'Holder\'s Water-type attacks have 1.2x power.'
  },
  {
    id: 'nanabberry',
    name: 'Nanab Berry'
  },
  {
    id: 'nestball',
    name: 'Nest Ball',
    num: 8,
    gen: 3,
    desc: 'A Poke Ball that works especially well on weaker Pokemon in the wild.'
  },
  {
    id: 'netball',
    name: 'Net Ball',
    num: 6,
    gen: 3,
    desc: 'A Poke Ball that works especially well on Water- and Bug-type Pokemon.'
  },
  {
    id: 'nevermeltice',
    name: 'Never-Melt Ice',
    num: 246,
    gen: 2,
    desc: 'Holder\'s Ice-type attacks have 1.2x power.'
  },
  {
    id: 'nomelberry',
    name: 'Nomel Berry'
  },
  {
    id: 'normalgem',
    name: 'Normal Gem',
    num: 564,
    gen: 5,
    desc: 'Holder\'s first successful Normal-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'normaliumz',
    name: 'Normalium Z',
    num: 776,
    gen: 7,
    desc: 'If holder has a Normal move, this item allows it to use a Normal Z-Move.'
  },
  {
    id: 'occaberry',
    name: 'Occa Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Fire-type attack. Single use.'
  },
  {
    id: 'oddincense',
    name: 'Odd Incense',
    desc: 'Holder\'s Psychic-type attacks have 1.2x power.'
  },
  {
    id: 'oldamber',
    name: 'Old Amber',
    num: 103,
    gen: 3,
    desc: 'Can be revived into Aerodactyl.'
  },
  {
    id: 'oranberry',
    name: 'Oran Berry',
    num: 155,
    gen: 3,
    desc: 'Restores 10 HP when at 1/2 max HP or less. Single use.'
  },
  {
    id: 'ovalstone',
    name: 'Oval Stone',
    num: 110,
    gen: 4,
    desc: 'Evolves Happiny into Chansey when held and leveled up during the day.'
  },
  {
    id: 'pamtreberry',
    name: 'Pamtre Berry'
  },
  {
    id: 'parkball',
    name: 'Park Ball',
    num: 500,
    gen: 4,
    desc: 'A special Poke Ball for the Pal Park.'
  },
  {
    id: 'passhoberry',
    name: 'Passho Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Water-type attack. Single use.'
  },
  {
    id: 'payapaberry',
    name: 'Payapa Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Psychic-type attack. Single use.'
  },
  {
    id: 'pechaberry',
    name: 'Pecha Berry',
    gen: 3,
    desc: 'Holder is cured if it is poisoned. Single use.'
  },
  {
    id: 'persimberry',
    name: 'Persim Berry'
  },
  {
    id: 'petayaberry',
    name: 'Petaya Berry'
  },
  {
    id: 'pidgeotite',
    name: 'Pidgeotite',
    num: 762,
    gen: 6,
    desc: 'If held by a Pidgeot, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'pikaniumz',
    name: 'Pikanium Z',
    num: 794,
    gen: 7,
    desc: 'If held by a Pikachu with Volt Tackle, it can use Catastropika.'
  },
  {
    id: 'pikashuniumz',
    name: 'Pikashunium Z',
    num: 836,
    gen: 7,
    desc: 'If held by cap Pikachu with Thunderbolt, it can use 10,000,000 Volt Thunderbolt.'
  },
  {
    id: 'pinapberry',
    name: 'Pinap Berry'
  },
  {
    id: 'pinsirite',
    name: 'Pinsirite',
    num: 671,
    gen: 6,
    desc: 'If held by a Pinsir, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'pixieplate',
    name: 'Pixie Plate',
    num: 644,
    gen: 6,
    desc: 'Holder\'s Fairy-type attacks have 1.2x power. Judgment is Fairy type.'
  },
  {
    id: 'plumefossil',
    name: 'Plume Fossil',
    num: 573,
    gen: 5,
    desc: 'Can be revived into Archen.'
  },
  {
    id: 'poisonbarb',
    name: 'Poison Barb',
    desc: 'Holder\'s Poison-type attacks have 1.2x power.'
  },
  {
    id: 'poisongem',
    name: 'Poison Gem',
    num: 554,
    gen: 5,
    desc: 'Holder\'s first successful Poison-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'poisonmemory',
    name: 'Poison Memory',
    num: 906,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Poison type.'
  },
  {
    id: 'poisoniumz',
    name: 'Poisonium Z',
    num: 783,
    gen: 7,
    desc: 'If holder has a Poison move, this item allows it to use a Poison Z-Move.'
  },
  {
    id: 'pokeball',
    name: 'Poke Ball',
    num: 4,
    gen: 1,
    desc: 'A device for catching wild Pokemon. It is designed as a capsule system.'
  },
  {
    id: 'pomegberry',
    name: 'Pomeg Berry'
  },
  {
    id: 'poweranklet',
    name: 'Power Anklet',
    num: 293,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'powerband',
    name: 'Power Band',
    num: 292,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'powerbelt',
    name: 'Power Belt',
    num: 290,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'powerbracer',
    name: 'Power Bracer',
    num: 289,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'powerherb',
    name: 'Power Herb',
    num: 271,
    gen: 4,
    desc: 'Holder\'s two-turn moves complete in one turn (except Sky Drop). Single use.'
  },
  {
    id: 'powerlens',
    name: 'Power Lens',
    num: 291,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'powerweight',
    name: 'Power Weight',
    num: 294,
    gen: 4,
    desc: 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
  },
  {
    id: 'premierball',
    name: 'Premier Ball',
    num: 12,
    gen: 3,
    desc: 'A rare Poke Ball that has been crafted to commemorate an event.'
  },
  {
    id: 'primariumz',
    name: 'Primarium Z',
    num: 800,
    gen: 7,
    desc: 'If held by a Primarina with Sparkling Aria, it can use Oceanic Operetta.'
  },
  {
    id: 'prismscale',
    name: 'Prism Scale',
    num: 537,
    gen: 5,
    desc: 'Evolves Feebas into Milotic when traded.'
  },
  {
    id: 'protectivepads',
    name: 'Protective Pads',
    desc: 'Holder\'s moves are protected from adverse contact effects, except Pickpocket.'
  },
  {
    id: 'protector',
    name: 'Protector',
    num: 321,
    gen: 4,
    desc: 'Evolves Rhydon into Rhyperior when traded.'
  },
  {
    id: 'psychicgem',
    name: 'Psychic Gem',
    num: 557,
    gen: 5,
    desc: 'Holder\'s first successful Psychic-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'psychicmemory',
    name: 'Psychic Memory',
    num: 916,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Psychic type.'
  },
  {
    id: 'psychicseed',
    name: 'Psychic Seed',
    desc: 'If the terrain is Psychic Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
  },
  {
    id: 'psychiumz',
    name: 'Psychium Z',
    num: 786,
    gen: 7,
    desc: 'If holder has a Psychic move, this item allows it to use a Psychic Z-Move.'
  },
  {
    id: 'qualotberry',
    name: 'Qualot Berry'
  },
  {
    id: 'quickball',
    name: 'Quick Ball',
    num: 15,
    gen: 4,
    desc: 'A Poke Ball that provides a better catch rate at the start of a wild encounter.'
  },
  {
    id: 'quickclaw',
    name: 'Quick Claw',
    num: 217,
    gen: 2,
    desc: 'Each turn, holder has a 20% chance to move first in its priority bracket.'
  },
  {
    id: 'quickpowder',
    name: 'Quick Powder',
    desc: 'If held by a Ditto that hasn\'t Transformed, its Speed is doubled.'
  },
  {
    id: 'rabutaberry',
    name: 'Rabuta Berry'
  },
  {
    id: 'rarebone',
    name: 'Rare Bone',
    num: 106,
    gen: 4,
    desc: 'No competitive use other than when used with Fling.'
  },
  {
    id: 'rawstberry',
    name: 'Rawst Berry',
    gen: 3,
    desc: 'Holder is cured if it is burned. Single use.'
  },
  {
    id: 'razorclaw',
    name: 'Razor Claw',
    spritenum: 382
  },
  {
    id: 'razorfang',
    name: 'Razor Fang',
    num: 327,
    gen: 4,
    desc: 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch. Evolves Gligar into Gliscor when held and leveled up during the night.',
    shortDesc: 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
  },
  {
    id: 'razzberry',
    name: 'Razz Berry'
  },
  {
    id: 'reapercloth',
    name: 'Reaper Cloth',
    num: 325,
    gen: 4,
    desc: 'Evolves Dusclops into Dusknoir when traded.'
  },
  {
    id: 'redcard',
    name: 'Red Card',
    num: 542,
    gen: 5,
    desc: 'If holder survives a hit, attacker is forced to switch to a random ally. Single use.'
  },
  {
    id: 'redorb',
    name: 'Red Orb',
    desc: 'If held by a Groudon, this item triggers its Primal Reversion in battle.'
  },
  {
    id: 'repeatball',
    name: 'Repeat Ball',
    num: 9,
    gen: 3,
    desc: 'A Poke Ball that works well on Pokemon species that were previously caught.'
  },
  {
    id: 'rindoberry',
    name: 'Rindo Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Grass-type attack. Single use.'
  },
  {
    id: 'ringtarget',
    name: 'Ring Target',
    num: 543,
    gen: 5,
    desc: 'The holder\'s type immunities granted solely by its typing are negated.'
  },
  {
    id: 'rockgem',
    name: 'Rock Gem',
    num: 559,
    gen: 5,
    desc: 'Holder\'s first successful Rock-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'rockincense',
    name: 'Rock Incense',
    desc: 'Holder\'s Rock-type attacks have 1.2x power.'
  },
  {
    id: 'rockmemory',
    name: 'Rock Memory',
    num: 908,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Rock type.'
  },
  {
    id: 'rockiumz',
    name: 'Rockium Z',
    num: 788,
    gen: 7,
    desc: 'If holder has a Rock move, this item allows it to use a Rock Z-Move.'
  },
  {
    id: 'rockyhelmet',
    name: 'Rocky Helmet',
    desc: 'If holder is hit by a contact move, the attacker loses 1/6 of its max HP.'
  },
  {
    id: 'rootfossil',
    name: 'Root Fossil',
    num: 99,
    gen: 3,
    desc: 'Can be revived into Lileep.'
  },
  {
    id: 'roseincense',
    name: 'Rose Incense',
    desc: 'Holder\'s Grass-type attacks have 1.2x power.'
  },
  {
    id: 'roseliberry',
    name: 'Roseli Berry',
    gen: 6,
    desc: 'Halves damage taken from a supereffective Fairy-type attack. Single use.'
  },
  {
    id: 'rowapberry',
    name: 'Rowap Berry'
  },
  {
    id: 'sablenite',
    name: 'Sablenite',
    num: 754,
    gen: 6,
    desc: 'If held by a Sableye, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'sachet',
    name: 'Sachet',
    num: 647,
    gen: 6,
    desc: 'Evolves Spritzee into Aromatisse when traded.'
  },
  {
    id: 'safariball',
    name: 'Safari Ball',
    num: 5,
    gen: 1,
    desc: 'A special Poke Ball that is used only in the Safari Zone and Great Marsh.'
  },
  {
    id: 'safetygoggles',
    name: 'Safety Goggles',
    gen: 6,
    desc: 'Holder is immune to powder moves and damage from Sandstorm or Hail.'
  },
  {
    id: 'sailfossil',
    name: 'Sail Fossil',
    num: 711,
    gen: 6,
    desc: 'Can be revived into Amaura.'
  },
  {
    id: 'salacberry',
    name: 'Salac Berry'
  },
  {
    id: 'salamencite',
    name: 'Salamencite',
    num: 769,
    gen: 6,
    desc: 'If held by a Salamence, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'sceptilite',
    name: 'Sceptilite',
    num: 753,
    gen: 6,
    desc: 'If held by a Sceptile, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'scizorite',
    name: 'Scizorite',
    num: 670,
    gen: 6,
    desc: 'If held by a Scizor, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'scopelens',
    name: 'Scope Lens',
    spritenum: 429
  },
  {
    id: 'seaincense',
    name: 'Sea Incense',
    desc: 'Holder\'s Water-type attacks have 1.2x power.'
  },
  {
    id: 'sharpbeak',
    name: 'Sharp Beak',
    desc: 'Holder\'s Flying-type attacks have 1.2x power.'
  },
  {
    id: 'sharpedonite',
    name: 'Sharpedonite',
    num: 759,
    gen: 6,
    desc: 'If held by a Sharpedo, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'shedshell',
    name: 'Shed Shell'
  },
  {
    id: 'shellbell',
    name: 'Shell Bell',
    desc: 'After an attack, holder gains 1/8 of the damage in HP dealt to other Pokemon.'
  },
  {
    id: 'shinystone',
    name: 'Shiny Stone',
    num: 107,
    gen: 4,
    desc: 'Evolves Togetic into Togekiss, Roselia into Roserade, Minccino into Cinccino, and Floette into Florges when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'shockdrive',
    name: 'Shock Drive',
    num: 117,
    gen: 5,
    desc: 'Holder\'s Techno Blast is Electric type.'
  },
  {
    id: 'shucaberry',
    name: 'Shuca Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Ground-type attack. Single use.'
  },
  {
    id: 'silkscarf',
    name: 'Silk Scarf',
    desc: 'Holder\'s Normal-type attacks have 1.2x power.'
  },
  {
    id: 'silverpowder',
    name: 'SilverPowder',
    desc: 'Holder\'s Bug-type attacks have 1.2x power.'
  },
  {
    id: 'sitrusberry',
    name: 'Sitrus Berry'
  },
  {
    id: 'skullfossil',
    name: 'Skull Fossil',
    num: 105,
    gen: 4,
    desc: 'Can be revived into Cranidos.'
  },
  {
    id: 'skyplate',
    name: 'Sky Plate',
    num: 306,
    gen: 4,
    desc: 'Holder\'s Flying-type attacks have 1.2x power. Judgment is Flying type.'
  },
  {
    id: 'slowbronite',
    name: 'Slowbronite',
    num: 760,
    gen: 6,
    desc: 'If held by a Slowbro, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'smoothrock',
    name: 'Smooth Rock',
    num: 283,
    gen: 4,
    desc: 'Holder\'s use of Sandstorm lasts 8 turns instead of 5.'
  },
  {
    id: 'snorliumz',
    name: 'Snorlium Z',
    num: 804,
    gen: 7,
    desc: 'If held by a Snorlax with Giga Impact, it can use Pulverizing Pancake.'
  },
  {
    id: 'snowball',
    name: 'Snowball',
    desc: 'Raises holder\'s Attack by 1 if hit by an Ice-type attack. Single use.'
  },
  {
    id: 'softsand',
    name: 'Soft Sand',
    desc: 'Holder\'s Ground-type attacks have 1.2x power.'
  },
  {
    id: 'solganiumz',
    name: 'Solganium Z',
    num: 921,
    gen: 7,
    desc: 'Solgaleo or Dusk Mane Necrozma with Sunsteel Strike can use a special Z-Move.'
  },
  {
    id: 'souldew',
    name: 'Soul Dew',
    desc: 'If held by a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.'
  },
  {
    id: 'spelltag',
    name: 'Spell Tag',
    desc: 'Holder\'s Ghost-type attacks have 1.2x power.'
  },
  {
    id: 'spelonberry',
    name: 'Spelon Berry'
  },
  {
    id: 'splashplate',
    name: 'Splash Plate',
    num: 299,
    gen: 4,
    desc: 'Holder\'s Water-type attacks have 1.2x power. Judgment is Water type.'
  },
  {
    id: 'spookyplate',
    name: 'Spooky Plate',
    num: 310,
    gen: 4,
    desc: 'Holder\'s Ghost-type attacks have 1.2x power. Judgment is Ghost type.'
  },
  {
    id: 'sportball',
    name: 'Sport Ball',
    num: 499,
    gen: 2,
    desc: 'A special Poke Ball for the Bug-Catching Contest.'
  },
  {
    id: 'starfberry',
    name: 'Starf Berry',
    num: 207,
    gen: 3,
    desc: 'Raises a random stat by 2 when at 1/4 max HP or less (not acc/eva). Single use.'
  },
  {
    id: 'steelixite',
    name: 'Steelixite',
    num: 761,
    gen: 6,
    desc: 'If held by a Steelix, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'steelgem',
    name: 'Steel Gem',
    num: 563,
    gen: 5,
    desc: 'Holder\'s first successful Steel-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'steelmemory',
    name: 'Steel Memory',
    num: 911,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Steel type.'
  },
  {
    id: 'steeliumz',
    name: 'Steelium Z',
    num: 792,
    gen: 7,
    desc: 'If holder has a Steel move, this item allows it to use a Steel Z-Move.'
  },
  {
    id: 'stick',
    name: 'Stick',
    desc: 'If held by a Farfetch\'d, its critical hit ratio is raised by 2 stages.'
  },
  {
    id: 'stickybarb',
    name: 'Sticky Barb',
    num: 288,
    gen: 4,
    desc: 'Each turn, holder loses 1/8 max HP. An attacker making contact can receive it.'
  },
  {
    id: 'stoneplate',
    name: 'Stone Plate',
    num: 309,
    gen: 4,
    desc: 'Holder\'s Rock-type attacks have 1.2x power. Judgment is Rock type.'
  },
  {
    id: 'sunstone',
    name: 'Sun Stone',
    num: 80,
    gen: 2,
    desc: 'Evolves Gloom into Bellossom, Sunkern into Sunflora, Cottonee into Whimsicott, Petilil into Lilligant, and Helioptile into Heliolisk when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'swampertite',
    name: 'Swampertite',
    num: 752,
    gen: 6,
    desc: 'If held by a Swampert, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'tamatoberry',
    name: 'Tamato Berry'
  },
  {
    id: 'tangaberry',
    name: 'Tanga Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Bug-type attack. Single use.'
  },
  {
    id: 'tapuniumz',
    name: 'Tapunium Z',
    num: 801,
    gen: 7,
    desc: 'If held by a Tapu with Nature\'s Madness, it can use Guardian of Alola.'
  },
  {
    id: 'terrainextender',
    name: 'Terrain Extender',
    num: 879,
    gen: 7,
    desc: 'Holder\'s use of Electric/Grassy/Misty/Psychic Terrain lasts 8 turns instead of 5.'
  },
  {
    id: 'thickclub',
    name: 'Thick Club',
    desc: 'If held by a Cubone or a Marowak, its Attack is doubled.'
  },
  {
    id: 'thunderstone',
    name: 'Thunder Stone',
    num: 83,
    gen: 1,
    desc: 'Evolves Pikachu into Raichu or Alolan Raichu, Eevee into Jolteon, and Eelektrik into Eelektross when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'timerball',
    name: 'Timer Ball',
    num: 10,
    gen: 3,
    desc: 'A Poke Ball that becomes better the more turns there are in a battle.'
  },
  {
    id: 'toxicorb',
    name: 'Toxic Orb'
  },
  {
    id: 'toxicplate',
    name: 'Toxic Plate',
    num: 304,
    gen: 4,
    desc: 'Holder\'s Poison-type attacks have 1.2x power. Judgment is Poison type.'
  },
  {
    id: 'twistedspoon',
    name: 'Twisted Spoon',
    desc: 'Holder\'s Psychic-type attacks have 1.2x power.'
  },
  {
    id: 'tyranitarite',
    name: 'Tyranitarite',
    num: 669,
    gen: 6,
    desc: 'If held by a Tyranitar, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'ultraball',
    name: 'Ultra Ball',
    num: 2,
    gen: 1,
    desc: 'An ultra-performance Ball that provides a higher catch rate than a Great Ball.'
  },
  {
    id: 'ultranecroziumz',
    name: 'Ultranecrozium Z',
    num: 923,
    gen: 7,
    desc: 'Dusk Mane/Dawn Wings Necrozma: Ultra Burst, then Z-Move w/ Photon Geyser.'
  },
  {
    id: 'upgrade',
    name: 'Up-Grade',
    num: 252,
    gen: 2,
    desc: 'Evolves Porygon into Porygon2 when traded.'
  },
  {
    id: 'venusaurite',
    name: 'Venusaurite',
    num: 659,
    gen: 6,
    desc: 'If held by a Venusaur, this item allows it to Mega Evolve in battle.'
  },
  {
    id: 'wacanberry',
    name: 'Wacan Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Electric-type attack. Single use.'
  },
  {
    id: 'watergem',
    name: 'Water Gem',
    num: 549,
    gen: 5,
    desc: 'Holder\'s first successful Water-type attack will have 1.3x power. Single use.'
  },
  {
    id: 'watermemory',
    name: 'Water Memory',
    num: 913,
    gen: 7,
    desc: 'Holder\'s Multi-Attack is Water type.'
  },
  {
    id: 'waterstone',
    name: 'Water Stone',
    num: 84,
    gen: 1,
    desc: 'Evolves Poliwhirl into Poliwrath, Shellder into Cloyster, Staryu into Starmie, Eevee into Vaporeon, Lombre into Ludicolo, and Panpour into Simipour when used.',
    shortDesc: 'Evolves certain species of Pokemon when used.'
  },
  {
    id: 'wateriumz',
    name: 'Waterium Z',
    num: 778,
    gen: 7,
    desc: 'If holder has a Water move, this item allows it to use a Water Z-Move.'
  },
  {
    id: 'watmelberry',
    name: 'Watmel Berry'
  },
  {
    id: 'waveincense',
    name: 'Wave Incense',
    desc: 'Holder\'s Water-type attacks have 1.2x power.'
  },
  {
    id: 'weaknesspolicy',
    name: 'Weakness Policy',
    num: 639,
    gen: 6,
    desc: 'If holder is hit super effectively, raises Attack, Sp. Atk by 2 stages. Single use.'
  },
  {
    id: 'wepearberry',
    name: 'Wepear Berry'
  },
  {
    id: 'whippeddream',
    name: 'Whipped Dream',
    num: 646,
    gen: 6,
    desc: 'Evolves Swirlix into Slurpuff when traded.'
  },
  {
    id: 'whiteherb',
    name: 'White Herb',
    num: 214,
    gen: 3,
    desc: 'Restores all lowered stat stages to 0 when one is less than 0. Single use.'
  },
  {
    id: 'widelens',
    name: 'Wide Lens',
    desc: 'The accuracy of attacks by the holder is 1.1x.'
  },
  {
    id: 'wikiberry',
    name: 'Wiki Berry',
    gen: 3,
    desc: 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.'
  },
  {
    id: 'wiseglasses',
    name: 'Wise Glasses',
    desc: 'Holder\'s special attacks have 1.1x power.'
  },
  {
    id: 'yacheberry',
    name: 'Yache Berry',
    gen: 4,
    desc: 'Halves damage taken from a supereffective Ice-type attack. Single use.'
  },
  {
    id: 'zapplate',
    name: 'Zap Plate',
    num: 300,
    gen: 4,
    desc: 'Holder\'s Electric-type attacks have 1.2x power. Judgment is Electric type.'
  },
  {
    id: 'zoomlens',
    name: 'Zoom Lens',
    num: 276,
    gen: 4,
    desc: 'The accuracy of attacks by the holder is 1.2x if it moves after its target.'
  },
  {
    id: 'berserkgene',
    name: 'Berserk Gene',
    desc: '(Gen 2) On switch-in, raises holder\'s Attack by 2 and confuses it. Single use.'
  },
  {
    id: 'berry',
    name: 'Berry',
    num: 155,
    gen: 2,
    desc: '(Gen 2) Restores 10 HP when at 1/2 max HP or less. Single use.'
  },
  {
    id: 'bitterberry',
    name: 'Bitter Berry',
    desc: '(Gen 2) Holder is cured if it is confused. Single use.'
  },
  {
    id: 'burntberry',
    name: 'Burnt Berry',
    gen: 2,
    desc: '(Gen 2) Holder is cured if it is frozen. Single use.'
  },
  {
    id: 'goldberry',
    name: 'Gold Berry',
    num: 158,
    gen: 2,
    desc: '(Gen 2) Restores 30 HP when at 1/2 max HP or less. Single use.'
  },
  {
    id: 'iceberry',
    name: 'Ice Berry',
    gen: 2,
    desc: '(Gen 2) Holder is cured if it is burned. Single use.'
  },
  {
    id: 'mintberry',
    name: 'Mint Berry',
    gen: 2,
    desc: '(Gen 2) Holder wakes up if it is asleep. Single use.'
  },
  {
    id: 'miracleberry',
    name: 'Miracle Berry',
    desc: '(Gen 2) Holder cures itself if it is confused or has a status condition. Single use.'
  },
  {
    id: 'mysteryberry',
    name: 'Mystery Berry',
    num: 154,
    gen: 2,
    desc: '(Gen 2) Restores 5 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
  },
  {
    id: 'pinkbow',
    name: 'Pink Bow',
    desc: '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
  },
  {
    id: 'polkadotbow',
    name: 'Polkadot Bow',
    desc: '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
  },
  {
    id: 'przcureberry',
    name: 'PRZ Cure Berry',
    gen: 2,
    desc: '(Gen 2) Holder cures itself if it is paralyzed. Single use.'
  },
  {
    id: 'psncureberry',
    name: 'PSN Cure Berry',
    gen: 2,
    desc: '(Gen 2) Holder is cured if it is poisoned. Single use.'
  },
  {
    id: 'crucibellite',
    name: 'Crucibellite',
    num: -1,
    gen: 6,
    desc: 'If held by a Crucibelle, this item allows it to Mega Evolve in battle.'
  }
];

module.exports = {BattleItems};