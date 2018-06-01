/* eslint-disable */
const BattleItems = [{
		'id': 'abomasite',
		'name': 'Abomasite',
		'spritenum': 575,
		'megaStone': 'Abomasnow-Mega',
		'megaEvolves': 'Abomasnow',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 674,
		'gen': 6,
		'desc': 'If held by an Abomasnow, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'absolite',
		'name': 'Absolite',
		'spritenum': 576,
		'megaStone': 'Absol-Mega',
		'megaEvolves': 'Absol',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 677,
		'gen': 6,
		'desc': 'If held by an Absol, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'absorbbulb',
		'name': 'Absorb Bulb',
		'spritenum': 2,
		'fling': {
			'basePower': 30
		},
		'onAfterDamage' (damage, target, source, move) {
			if (move.type === 'Water' && target.useItem()) {
				this.boost({
					'spa': 1
				});
			}
		},
		'num': 545,
		'gen': 5,
		'desc': 'Raises holder\'s Sp. Atk by 1 stage if hit by a Water-type attack. Single use.'
	},
	{
		'id': 'adamantorb',
		'name': 'Adamant Orb',
		'spritenum': 4,
		'fling': {
			'basePower': 60
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && user.baseTemplate.species === 'Dialga' && (move.type === 'Steel' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 135,
		'gen': 4,
		'desc': 'If held by a Dialga, its Steel- and Dragon-type attacks have 1.2x power.'
	},
	{
		'id': 'adrenalineorb',
		'name': 'Adrenaline Orb',
		'spritenum': 660,
		'fling': {
			'basePower': 30
		},
		'onAfterBoost' (boost, target, source, effect) {
			if (effect.id === 'intimidate' && target.useItem()) {
				this.boost({
					'spe': 1
				});
			}
		},
		'num': 846,
		'gen': 7,
		'desc': 'Raises holder\'s Speed by 1 stage if it gets affected by Intimidate. Single use.'
	},
	{
		'id': 'aerodactylite',
		'name': 'Aerodactylite',
		'spritenum': 577,
		'megaStone': 'Aerodactyl-Mega',
		'megaEvolves': 'Aerodactyl',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 672,
		'gen': 6,
		'desc': 'If held by an Aerodactyl, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'aggronite',
		'name': 'Aggronite',
		'spritenum': 578,
		'megaStone': 'Aggron-Mega',
		'megaEvolves': 'Aggron',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 667,
		'gen': 6,
		'desc': 'If held by an Aggron, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'aguavberry',
		'name': 'Aguav Berry',
		'spritenum': 5,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Dragon'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spd') {
				pokemon.addVolatile('confusion');
			}
		},
		'num': 162,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.'
	},
	{
		'id': 'airballoon',
		'name': 'Air Balloon',
		'spritenum': 6,
		'fling': {
			'basePower': 10
		},
		'onStart' (target) {
			if (!target.ignoringItem() && !this.getPseudoWeather('gravity')) {
				this.add('-item', target, 'Air Balloon');
			}
		},
		// Airborneness implemented in sim/pokemon.js:Pokemon#isGrounded
		'onAfterDamage' (damage, target, source, effect) {
			this.debug(`effect: ${effect.id}`);
			if (effect.effectType === 'Move' && effect.id !== 'confused') {
				this.add('-enditem', target, 'Air Balloon');
				target.item = '';
				this.itemData = {
					'id': '',
					'target': this
				};
				this.runEvent('AfterUseItem', target, null, null, 'airballoon');
			}
		},
		'onAfterSubDamage' (damage, target, source, effect) {
			this.debug(`effect: ${effect.id}`);
			if (effect.effectType === 'Move' && effect.id !== 'confused') {
				this.add('-enditem', target, 'Air Balloon');
				target.item = '';
				this.itemData = {
					'id': '',
					'target': this
				};
				this.runEvent('AfterUseItem', target, null, null, 'airballoon');
			}
		},
		'num': 541,
		'gen': 5,
		'desc': 'Holder is immune to Ground-type attacks. Pops when holder is hit.'
	},
	{
		'id': 'alakazite',
		'name': 'Alakazite',
		'spritenum': 579,
		'megaStone': 'Alakazam-Mega',
		'megaEvolves': 'Alakazam',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 679,
		'gen': 6,
		'desc': 'If held by an Alakazam, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'aloraichiumz',
		'name': 'Aloraichium Z',
		'spritenum': 655,
		'onTakeItem': false,
		'zMove': 'Stoked Sparksurfer',
		'zMoveFrom': 'Thunderbolt',
		'zMoveUser': ['Raichu-Alola'],
		'num': 803,
		'gen': 7,
		'desc': 'If held by an Alolan Raichu with Thunderbolt, it can use Stoked Sparksurfer.'
	},
	{
		'id': 'altarianite',
		'name': 'Altarianite',
		'spritenum': 615,
		'megaStone': 'Altaria-Mega',
		'megaEvolves': 'Altaria',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 755,
		'gen': 6,
		'desc': 'If held by an Altaria, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'ampharosite',
		'name': 'Ampharosite',
		'spritenum': 580,
		'megaStone': 'Ampharos-Mega',
		'megaEvolves': 'Ampharos',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 658,
		'gen': 6,
		'desc': 'If held by an Ampharos, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'apicotberry',
		'name': 'Apicot Berry',
		'spritenum': 10,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Ground'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'spd': 1
			});
		},
		'num': 205,
		'gen': 3,
		'desc': 'Raises holder\'s Sp. Def by 1 stage when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'armorfossil',
		'name': 'Armor Fossil',
		'spritenum': 12,
		'fling': {
			'basePower': 100
		},
		'num': 104,
		'gen': 4,
		'desc': 'Can be revived into Shieldon.'
	},
	{
		'id': 'aspearberry',
		'name': 'Aspear Berry',
		'spritenum': 13,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ice'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.cureStatus();
			}
		},
		'num': 153,
		'gen': 3,
		'desc': 'Holder is cured if it is frozen. Single use.'
	},
	{
		'id': 'assaultvest',
		'name': 'Assault Vest',
		'spritenum': 581,
		'fling': {
			'basePower': 80
		},
		'onModifySpDPriority': 1,
		'onModifySpD' (spd) {
			return this.chainModify(1.5);
		},
		'onDisableMove' (pokemon) {
			for (const moveSlot of pokemon.moveSlots) {
				if (this.getMove(moveSlot.move).category === 'Status') {
					pokemon.disableMove(moveSlot.id);
				}
			}
		},
		'num': 640,
		'gen': 6,
		'desc': 'Holder\'s Sp. Def is 1.5x, but it can only select damaging moves.'
	},
	{
		'id': 'audinite',
		'name': 'Audinite',
		'spritenum': 617,
		'megaStone': 'Audino-Mega',
		'megaEvolves': 'Audino',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 757,
		'gen': 6,
		'desc': 'If held by an Audino, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'babiriberry',
		'name': 'Babiri Berry',
		'spritenum': 17,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Steel'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Steel' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 199,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Steel-type attack. Single use.'
	},
	{
		'id': 'banettite',
		'name': 'Banettite',
		'spritenum': 582,
		'megaStone': 'Banette-Mega',
		'megaEvolves': 'Banette',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 668,
		'gen': 6,
		'desc': 'If held by a Banette, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'beastball',
		'name': 'Beast Ball',
		'spritenum': 661,
		'num': 851,
		'gen': 7,
		'desc': 'A special Poke Ball designed to catch Ultra Beasts.'
	},
	{
		'id': 'beedrillite',
		'name': 'Beedrillite',
		'spritenum': 628,
		'megaStone': 'Beedrill-Mega',
		'megaEvolves': 'Beedrill',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 770,
		'gen': 6,
		'desc': 'If held by a Beedrill, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'belueberry',
		'name': 'Belue Berry',
		'isUnreleased': true,
		'spritenum': 21,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Electric'
		},
		'onEat': false,
		'num': 183,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'berryjuice',
		'name': 'Berry Juice',
		'spritenum': 22,
		'fling': {
			'basePower': 30
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				if (this.runEvent('TryHeal', pokemon) && pokemon.useItem()) {
					this.heal(20);
				}
			}
		},
		'num': 43,
		'gen': 2,
		'desc': 'Restores 20 HP when at 1/2 max HP or less. Single use.'
	},
	{
		'id': 'bigroot',
		'name': 'Big Root',
		'spritenum': 29,
		'fling': {
			'basePower': 10
		},
		'onTryHealPriority': 1,
		'onTryHeal' (damage, target, source, effect) {
			const heals = {
				'drain': 1,
				'leechseed': 1,
				'ingrain': 1,
				'aquaring': 1,
				'strengthsap': 1
			};

			if (heals[effect.id]) {
				return Math.ceil(damage * 1.3 - 0.5); // Big Root rounds half down
			}
		},
		'num': 296,
		'gen': 4,
		'desc': 'Holder gains 1.3x HP from draining/Aqua Ring/Ingrain/Leech Seed/Strength Sap.'
	},
	{
		'id': 'bindingband',
		'name': 'Binding Band',
		'spritenum': 31,
		'fling': {
			'basePower': 30
		},
		// Implemented in statuses
		'num': 544,
		'gen': 5,
		'desc': 'Holder\'s partial-trapping moves deal 1/6 max HP per turn instead of 1/8.'
	},
	{
		'id': 'blackbelt',
		'name': 'Black Belt',
		'spritenum': 32,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Fighting') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 241,
		'gen': 2,
		'desc': 'Holder\'s Fighting-type attacks have 1.2x power.'
	},
	{
		'id': 'blacksludge',
		'name': 'Black Sludge',
		'spritenum': 34,
		'fling': {
			'basePower': 30
		},
		'onResidualOrder': 5,
		'onResidualSubOrder': 2,
		'onResidual' (pokemon) {
			if (this.isTerrain('grassyterrain')) {
				return;
			}
			if (pokemon.hasType('Poison')) {
				this.heal(pokemon.maxhp / 16);
			} else {
				this.damage(pokemon.maxhp / 8);
			}
		},
		'onTerrain' (pokemon) {
			if (!this.isTerrain('grassyterrain')) {
				return;
			}
			if (pokemon.hasType('Poison')) {
				this.heal(pokemon.maxhp / 16);
			} else {
				this.damage(pokemon.maxhp / 8);
			}
		},
		'num': 281,
		'gen': 4,
		'desc': 'Each turn, if holder is a Poison type, restores 1/16 max HP; loses 1/8 if not.'
	},
	{
		'id': 'blackglasses',
		'name': 'Black Glasses',
		'spritenum': 35,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Dark') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 240,
		'gen': 2,
		'desc': 'Holder\'s Dark-type attacks have 1.2x power.'
	},
	{
		'id': 'blastoisinite',
		'name': 'Blastoisinite',
		'spritenum': 583,
		'megaStone': 'Blastoise-Mega',
		'megaEvolves': 'Blastoise',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 661,
		'gen': 6,
		'desc': 'If held by a Blastoise, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'blazikenite',
		'name': 'Blazikenite',
		'spritenum': 584,
		'megaStone': 'Blaziken-Mega',
		'megaEvolves': 'Blaziken',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 664,
		'gen': 6,
		'desc': 'If held by a Blaziken, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'blueorb',
		'name': 'Blue Orb',
		'spritenum': 41,
		'onSwitchIn' (pokemon) {
			if (pokemon.isActive && pokemon.baseTemplate.species === 'Kyogre') {
				this.insertQueue({
					pokemon,
					'choice': 'runPrimal'
				});
			}
		},
		'onPrimal' (pokemon) {
			const template = this.getTemplate('Kyogre-Primal');

			pokemon.formeChange(template);
			pokemon.baseTemplate = template;
			pokemon.details = template.species + (pokemon.level === 100 ? '' : `, L${pokemon.level}`) + (pokemon.gender === '' ? '' : `, ${pokemon.gender}`) + (pokemon.set.shiny ? ', shiny' : '');
			if (pokemon.illusion) {
				pokemon.ability = ''; // Don't allow Illusion to wear off
				this.add('-primal', pokemon.illusion);
			} else {
				this.add('detailschange', pokemon, pokemon.details);
				this.add('-primal', pokemon);
			}
			pokemon.setAbility(template.abilities['0'], null, true);
			pokemon.baseAbility = pokemon.ability;
		},
		'onTakeItem' (item, source) {
			if (source.baseTemplate.baseSpecies === 'Kyogre') {
				return false;
			}

			return true;
		},
		'num': 535,
		'gen': 6,
		'desc': 'If held by a Kyogre, this item triggers its Primal Reversion in battle.'
	},
	{
		'id': 'blukberry',
		'name': 'Bluk Berry',
		'spritenum': 44,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Fire'
		},
		'onEat': false,
		'num': 165,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'brightpowder',
		'name': 'BrightPowder',
		'spritenum': 51,
		'fling': {
			'basePower': 10
		},
		'onModifyAccuracy' (accuracy) {
			if (typeof accuracy !== 'number') {
				return;
			}
			this.debug('brightpowder - decreasing accuracy');

			return accuracy * 0.9;
		},
		'num': 213,
		'gen': 2,
		'desc': 'The accuracy of attacks against the holder is 0.9x.'
	},
	{
		'id': 'buggem',
		'name': 'Bug Gem',
		'isUnreleased': true,
		'spritenum': 53,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Bug') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Bug Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 558,
		'gen': 5,
		'desc': 'Holder\'s first successful Bug-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'bugmemory',
		'name': 'Bug Memory',
		'spritenum': 673,
		'onMemory': 'Bug',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Bug',
		'num': 909,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Bug type.'
	},
	{
		'id': 'buginiumz',
		'name': 'Buginium Z',
		'spritenum': 642,
		'onPlate': 'Bug',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Bug',
		'forcedForme': 'Arceus-Bug',
		'num': 787,
		'gen': 7,
		'desc': 'If holder has a Bug move, this item allows it to use a Bug Z-Move.'
	},
	{
		'id': 'burndrive',
		'name': 'Burn Drive',
		'spritenum': 54,
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 649 || pokemon.baseTemplate.num === 649) {
				return false;
			}

			return true;
		},
		'onDrive': 'Fire',
		'forcedForme': 'Genesect-Burn',
		'num': 118,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Fire type.'
	},
	{
		'id': 'cameruptite',
		'name': 'Cameruptite',
		'spritenum': 625,
		'megaStone': 'Camerupt-Mega',
		'megaEvolves': 'Camerupt',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 767,
		'gen': 6,
		'desc': 'If held by a Camerupt, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'cellbattery',
		'name': 'Cell Battery',
		'spritenum': 60,
		'fling': {
			'basePower': 30
		},
		'onAfterDamage' (damage, target, source, move) {
			if (move.type === 'Electric' && target.useItem()) {
				this.boost({
					'atk': 1
				});
			}
		},
		'num': 546,
		'gen': 5,
		'desc': 'Raises holder\'s Attack by 1 if hit by an Electric-type attack. Single use.'
	},
	{
		'id': 'charcoal',
		'name': 'Charcoal',
		'spritenum': 61,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Fire') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 249,
		'gen': 2,
		'desc': 'Holder\'s Fire-type attacks have 1.2x power.'
	},
	{
		'id': 'charizarditex',
		'name': 'Charizardite X',
		'spritenum': 585,
		'megaStone': 'Charizard-Mega-X',
		'megaEvolves': 'Charizard',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 660,
		'gen': 6,
		'desc': 'If held by a Charizard, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'charizarditey',
		'name': 'Charizardite Y',
		'spritenum': 586,
		'megaStone': 'Charizard-Mega-Y',
		'megaEvolves': 'Charizard',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 678,
		'gen': 6,
		'desc': 'If held by a Charizard, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'chartiberry',
		'name': 'Charti Berry',
		'spritenum': 62,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Rock'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Rock' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 195,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Rock-type attack. Single use.'
	},
	{
		'id': 'cheriberry',
		'name': 'Cheri Berry',
		'spritenum': 63,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fire'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'par') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'par') {
				pokemon.cureStatus();
			}
		},
		'num': 149,
		'gen': 3,
		'desc': 'Holder cures itself if it is paralyzed. Single use.'
	},
	{
		'id': 'cherishball',
		'name': 'Cherish Ball',
		'spritenum': 64,
		'num': 16,
		'gen': 4,
		'desc': 'A rare Poke Ball that has been crafted to commemorate an occasion.'
	},
	{
		'id': 'chestoberry',
		'name': 'Chesto Berry',
		'spritenum': 65,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Water'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.cureStatus();
			}
		},
		'num': 150,
		'gen': 3,
		'desc': 'Holder wakes up if it is asleep. Single use.'
	},
	{
		'id': 'chilanberry',
		'name': 'Chilan Berry',
		'spritenum': 66,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Normal'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Normal' && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 200,
		'gen': 4,
		'desc': 'Halves damage taken from a Normal-type attack. Single use.'
	},
	{
		'id': 'chilldrive',
		'name': 'Chill Drive',
		'spritenum': 67,
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 649 || pokemon.baseTemplate.num === 649) {
				return false;
			}

			return true;
		},
		'onDrive': 'Ice',
		'forcedForme': 'Genesect-Chill',
		'num': 119,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Ice type.'
	},
	{
		'id': 'choiceband',
		'name': 'Choice Band',
		'spritenum': 68,
		'fling': {
			'basePower': 10
		},
		'onStart' (pokemon) {
			if (pokemon.volatiles.choicelock) {
				this.debug(`removing choicelock: ${pokemon.volatiles.choicelock}`);
			}
			pokemon.removeVolatile('choicelock');
		},
		'onModifyMove' (move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		'onModifyAtkPriority': 1,
		'onModifyAtk' (atk) {
			return this.chainModify(1.5);
		},
		'isChoice': true,
		'num': 220,
		'gen': 3,
		'desc': 'Holder\'s Attack is 1.5x, but it can only select the first move it executes.'
	},
	{
		'id': 'choicescarf',
		'name': 'Choice Scarf',
		'spritenum': 69,
		'fling': {
			'basePower': 10
		},
		'onStart' (pokemon) {
			if (pokemon.volatiles.choicelock) {
				this.debug(`removing choicelock: ${pokemon.volatiles.choicelock}`);
			}
			pokemon.removeVolatile('choicelock');
		},
		'onModifyMove' (move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		'onModifySpe' (spe) {
			return this.chainModify(1.5);
		},
		'isChoice': true,
		'num': 287,
		'gen': 4,
		'desc': 'Holder\'s Speed is 1.5x, but it can only select the first move it executes.'
	},
	{
		'id': 'choicespecs',
		'name': 'Choice Specs',
		'spritenum': 70,
		'fling': {
			'basePower': 10
		},
		'onStart' (pokemon) {
			if (pokemon.volatiles.choicelock) {
				this.debug(`removing choicelock: ${pokemon.volatiles.choicelock}`);
			}
			pokemon.removeVolatile('choicelock');
		},
		'onModifyMove' (move, pokemon) {
			pokemon.addVolatile('choicelock');
		},
		'onModifySpAPriority': 1,
		'onModifySpA' (spa) {
			return this.chainModify(1.5);
		},
		'isChoice': true,
		'num': 297,
		'gen': 4,
		'desc': 'Holder\'s Sp. Atk is 1.5x, but it can only select the first move it executes.'
	},
	{
		'id': 'chopleberry',
		'name': 'Chople Berry',
		'spritenum': 71,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fighting'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Fighting' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 189,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Fighting-type attack. Single use.'
	},
	{
		'id': 'clawfossil',
		'name': 'Claw Fossil',
		'spritenum': 72,
		'fling': {
			'basePower': 100
		},
		'num': 100,
		'gen': 3,
		'desc': 'Can be revived into Anorith.'
	},
	{
		'id': 'cobaberry',
		'name': 'Coba Berry',
		'spritenum': 76,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Flying'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Flying' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 192,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Flying-type attack. Single use.'
	},
	{
		'id': 'colburberry',
		'name': 'Colbur Berry',
		'spritenum': 78,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Dark'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Dark' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 198,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Dark-type attack. Single use.'
	},
	{
		'id': 'cornnberry',
		'name': 'Cornn Berry',
		'isUnreleased': true,
		'spritenum': 81,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Bug'
		},
		'onEat': false,
		'num': 175,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'coverfossil',
		'name': 'Cover Fossil',
		'spritenum': 85,
		'fling': {
			'basePower': 100
		},
		'num': 572,
		'gen': 5,
		'desc': 'Can be revived into Tirtouga.'
	},
	{
		'id': 'custapberry',
		'name': 'Custap Berry',
		'isUnreleased': true,
		'spritenum': 86,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Ghost'
		},
		'onModifyPriorityPriority': -1,
		'onModifyPriority' (priority, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				if (pokemon.eatItem()) {
					this.add('-activate', pokemon, 'item: Custap Berry', '[consumed]');
					pokemon.removeVolatile('custapberry');

					return Math.round(priority) + 0.1;
				}
			}
		},
		'onEat' () {},
		'num': 210,
		'gen': 4,
		'desc': 'Holder moves first in its priority bracket when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'damprock',
		'name': 'Damp Rock',
		'spritenum': 88,
		'fling': {
			'basePower': 60
		},
		'num': 285,
		'gen': 4,
		'desc': 'Holder\'s use of Rain Dance lasts 8 turns instead of 5.'
	},
	{
		'id': 'darkgem',
		'name': 'Dark Gem',
		'isUnreleased': true,
		'spritenum': 89,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Dark') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Dark Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 562,
		'gen': 5,
		'desc': 'Holder\'s first successful Dark-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'darkmemory',
		'name': 'Dark Memory',
		'spritenum': 683,
		'onMemory': 'Dark',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Dark',
		'num': 919,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Dark type.'
	},
	{
		'id': 'darkiniumz',
		'name': 'Darkinium Z',
		'spritenum': 646,
		'onPlate': 'Dark',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Dark',
		'forcedForme': 'Arceus-Dark',
		'num': 791,
		'gen': 7,
		'desc': 'If holder has a Dark move, this item allows it to use a Dark Z-Move.'
	},
	{
		'id': 'decidiumz',
		'name': 'Decidium Z',
		'spritenum': 650,
		'onTakeItem': false,
		'zMove': 'Sinister Arrow Raid',
		'zMoveFrom': 'Spirit Shackle',
		'zMoveUser': ['Decidueye'],
		'num': 798,
		'gen': 7,
		'desc': 'If held by a Decidueye with Spirit Shackle, it can use Sinister Arrow Raid.'
	},
	{
		'id': 'deepseascale',
		'name': 'Deep Sea Scale',
		'spritenum': 93,
		'fling': {
			'basePower': 30
		},
		'onModifySpDPriority': 2,
		'onModifySpD' (spd, pokemon) {
			if (pokemon.baseTemplate.species === 'Clamperl') {
				return this.chainModify(2);
			}
		},
		'num': 227,
		'gen': 3,
		'desc': 'If held by a Clamperl, its Sp. Def is doubled.'
	},
	{
		'id': 'deepseatooth',
		'name': 'Deep Sea Tooth',
		'spritenum': 94,
		'fling': {
			'basePower': 90
		},
		'onModifySpAPriority': 1,
		'onModifySpA' (spa, pokemon) {
			if (pokemon.baseTemplate.species === 'Clamperl') {
				return this.chainModify(2);
			}
		},
		'num': 226,
		'gen': 3,
		'desc': 'If held by a Clamperl, its Sp. Atk is doubled.'
	},
	{
		'id': 'destinyknot',
		'name': 'Destiny Knot',
		'spritenum': 95,
		'fling': {
			'basePower': 10
		},
		'onAttractPriority': -100,
		'onAttract' (target, source) {
			this.debug(`attract intercepted: ${target} from ${source}`);
			if (!source || source === target) {
				return;
			}
			if (!source.volatiles.attract) {
				source.addVolatile('attract', target);
			}
		},
		'num': 280,
		'gen': 4,
		'desc': 'If holder becomes infatuated, the other Pokemon also becomes infatuated.'
	},
	{
		'id': 'diancite',
		'name': 'Diancite',
		'spritenum': 624,
		'megaStone': 'Diancie-Mega',
		'megaEvolves': 'Diancie',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 764,
		'gen': 6,
		'desc': 'If held by a Diancie, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'diveball',
		'name': 'Dive Ball',
		'spritenum': 101,
		'num': 7,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on Pokemon that live underwater.'
	},
	{
		'id': 'domefossil',
		'name': 'Dome Fossil',
		'spritenum': 102,
		'fling': {
			'basePower': 100
		},
		'num': 102,
		'gen': 3,
		'desc': 'Can be revived into Kabuto.'
	},
	{
		'id': 'dousedrive',
		'name': 'Douse Drive',
		'spritenum': 103,
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 649 || pokemon.baseTemplate.num === 649) {
				return false;
			}

			return true;
		},
		'onDrive': 'Water',
		'forcedForme': 'Genesect-Douse',
		'num': 116,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Water type.'
	},
	{
		'id': 'dracoplate',
		'name': 'Draco Plate',
		'spritenum': 105,
		'onPlate': 'Dragon',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Dragon') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Dragon',
		'num': 311,
		'gen': 4,
		'desc': 'Holder\'s Dragon-type attacks have 1.2x power. Judgment is Dragon type.'
	},
	{
		'id': 'dragonfang',
		'name': 'Dragon Fang',
		'spritenum': 106,
		'fling': {
			'basePower': 70
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Dragon') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 250,
		'gen': 2,
		'desc': 'Holder\'s Dragon-type attacks have 1.2x power.'
	},
	{
		'id': 'dragongem',
		'name': 'Dragon Gem',
		'isUnreleased': true,
		'spritenum': 107,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Dragon') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Dragon Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 561,
		'gen': 5,
		'desc': 'Holder\'s first successful Dragon-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'dragonmemory',
		'name': 'Dragon Memory',
		'spritenum': 682,
		'onMemory': 'Dragon',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Dragon',
		'num': 918,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Dragon type.'
	},
	{
		'id': 'dragoniumz',
		'name': 'Dragonium Z',
		'spritenum': 645,
		'onPlate': 'Dragon',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Dragon',
		'forcedForme': 'Arceus-Dragon',
		'num': 790,
		'gen': 7,
		'desc': 'If holder has a Dragon move, this item allows it to use a Dragon Z-Move.'
	},
	{
		'id': 'dreadplate',
		'name': 'Dread Plate',
		'spritenum': 110,
		'onPlate': 'Dark',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Dark') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Dark',
		'num': 312,
		'gen': 4,
		'desc': 'Holder\'s Dark-type attacks have 1.2x power. Judgment is Dark type.'
	},
	{
		'id': 'dreamball',
		'name': 'Dream Ball',
		'spritenum': 111,
		'num': 576,
		'gen': 5,
		'desc': 'A special Poke Ball that appears out of nowhere in a bag at the Entree Forest.'
	},
	{
		'id': 'durinberry',
		'name': 'Durin Berry',
		'isUnreleased': true,
		'spritenum': 114,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Water'
		},
		'onEat': false,
		'num': 182,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'duskball',
		'name': 'Dusk Ball',
		'spritenum': 115,
		'num': 13,
		'gen': 4,
		'desc': 'A Poke Ball that makes it easier to catch wild Pokemon at night or in caves.'
	},
	{
		'id': 'earthplate',
		'name': 'Earth Plate',
		'spritenum': 117,
		'onPlate': 'Ground',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Ground') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Ground',
		'num': 305,
		'gen': 4,
		'desc': 'Holder\'s Ground-type attacks have 1.2x power. Judgment is Ground type.'
	},
	{
		'id': 'eeviumz',
		'name': 'Eevium Z',
		'spritenum': 657,
		'onTakeItem': false,
		'zMove': 'Extreme Evoboost',
		'zMoveFrom': 'Last Resort',
		'zMoveUser': ['Eevee'],
		'num': 805,
		'gen': 7,
		'desc': 'If held by an Eevee with Last Resort, it can use Extreme Evoboost.'
	},
	{
		'id': 'ejectbutton',
		'name': 'Eject Button',
		'spritenum': 118,
		'fling': {
			'basePower': 30
		},
		'onAfterMoveSecondaryPriority': 2,
		'onAfterMoveSecondary' (target, source, move) {
			if (source && source !== target && target.hp && move && move.category !== 'Status') {
				if (!this.canSwitch(target.side) || target.forceSwitchFlag) {
					return;
				}
				if (target.useItem()) {
					target.switchFlag = true;
					source.switchFlag = false;
				}
			}
		},
		'num': 547,
		'gen': 5,
		'desc': 'If holder survives a hit, it immediately switches out to a chosen ally. Single use.'
	},
	{
		'id': 'electirizer',
		'name': 'Electirizer',
		'spritenum': 119,
		'fling': {
			'basePower': 80
		},
		'num': 322,
		'gen': 4,
		'desc': 'Evolves Electabuzz into Electivire when traded.'
	},
	{
		'id': 'electricgem',
		'name': 'Electric Gem',
		'isUnreleased': true,
		'spritenum': 120,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
				return;
			}
			if (move.type === 'Electric') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Electric Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 550,
		'gen': 5,
		'desc': 'Holder\'s first successful Electric-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'electricmemory',
		'name': 'Electric Memory',
		'spritenum': 679,
		'onMemory': 'Electric',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Electric',
		'num': 915,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Electric type.'
	},
	{
		'id': 'electricseed',
		'name': 'Electric Seed',
		'spritenum': 664,
		'fling': {
			'basePower': 10
		},
		'onUpdate' (pokemon) {
			if (this.isTerrain('electricterrain') && pokemon.useItem()) {
				this.boost({
					'def': 1
				});
			}
		},
		'num': 881,
		'gen': 7,
		'desc': 'If the terrain is Electric Terrain, raises holder\'s Defense by 1 stage. Single use.'
	},
	{
		'id': 'electriumz',
		'name': 'Electrium Z',
		'spritenum': 634,
		'onPlate': 'Electric',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Electric',
		'forcedForme': 'Arceus-Electric',
		'num': 779,
		'gen': 7,
		'desc': 'If holder has an Electric move, this item allows it to use an Electric Z-Move.'
	},
	{
		'id': 'energypowder',
		'name': 'Energy Powder',
		'spritenum': 123,
		'fling': {
			'basePower': 30
		},
		'num': 34,
		'gen': 2,
		'desc': 'Restores 50 HP to one Pokemon but lowers Happiness.'
	},
	{
		'id': 'enigmaberry',
		'name': 'Enigma Berry',
		'isUnreleased': true,
		'spritenum': 124,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Bug'
		},
		'onHit' (target, source, move) {
			if (move && move.typeMod > 0) {
				if (target.eatItem()) {
					this.heal(target.maxhp / 4);
				}
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' () {},
		'num': 208,
		'gen': 3,
		'desc': 'Restores 1/4 max HP after holder is hit by a supereffective move. Single use.'
	},
	{
		'id': 'eviolite',
		'name': 'Eviolite',
		'spritenum': 130,
		'fling': {
			'basePower': 40
		},
		'onModifyDefPriority': 2,
		'onModifyDef' (def, pokemon) {
			if (pokemon.baseTemplate.nfe) {
				return this.chainModify(1.5);
			}
		},
		'onModifySpDPriority': 2,
		'onModifySpD' (spd, pokemon) {
			if (pokemon.baseTemplate.nfe) {
				return this.chainModify(1.5);
			}
		},
		'num': 538,
		'gen': 5,
		'desc': 'If holder\'s species can evolve, its Defense and Sp. Def are 1.5x.'
	},
	{
		'id': 'expertbelt',
		'name': 'Expert Belt',
		'spritenum': 132,
		'fling': {
			'basePower': 10
		},
		'onModifyDamage' (damage, source, target, move) {
			if (move && move.typeMod > 0) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 268,
		'gen': 4,
		'desc': 'Holder\'s attacks that are super effective against the target do 1.2x damage.'
	},
	{
		'id': 'fairiumz',
		'name': 'Fairium Z',
		'spritenum': 648,
		'onPlate': 'Fairy',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Fairy',
		'forcedForme': 'Arceus-Fairy',
		'num': 793,
		'gen': 7,
		'desc': 'If holder has a Fairy move, this item allows it to use a Fairy Z-Move.'
	},
	{
		'id': 'fairygem',
		'name': 'Fairy Gem',
		'isUnreleased': true,
		'spritenum': 611,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Fairy') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Fairy Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 715,
		'gen': 6,
		'desc': 'Holder\'s first successful Fairy-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'fairymemory',
		'name': 'Fairy Memory',
		'spritenum': 684,
		'onMemory': 'Fairy',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Fairy',
		'num': 920,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fairy type.'
	},
	{
		'id': 'fastball',
		'name': 'Fast Ball',
		'spritenum': 137,
		'num': 492,
		'gen': 2,
		'desc': 'A Poke Ball that makes it easier to catch Pokemon which are quick to run away.'
	},
	{
		'id': 'fightinggem',
		'name': 'Fighting Gem',
		'isUnreleased': true,
		'spritenum': 139,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Fighting') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Fighting Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 553,
		'gen': 5,
		'desc': 'Holder\'s first successful Fighting-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'fightingmemory',
		'name': 'Fighting Memory',
		'spritenum': 668,
		'onMemory': 'Fighting',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Fighting',
		'num': 904,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fighting type.'
	},
	{
		'id': 'fightiniumz',
		'name': 'Fightinium Z',
		'spritenum': 637,
		'onPlate': 'Fighting',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Fighting',
		'forcedForme': 'Arceus-Fighting',
		'num': 782,
		'gen': 7,
		'desc': 'If holder has a Fighting move, this item allows it to use a Fighting Z-Move.'
	},
	{
		'id': 'figyberry',
		'name': 'Figy Berry',
		'spritenum': 140,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Bug'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'atk') {
				pokemon.addVolatile('confusion');
			}
		},
		'num': 159,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.'
	},
	{
		'id': 'firegem',
		'name': 'Fire Gem',
		'isUnreleased': true,
		'spritenum': 141,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
				return;
			}
			if (move.type === 'Fire') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Fire Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 548,
		'gen': 5,
		'desc': 'Holder\'s first successful Fire-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'firememory',
		'name': 'Fire Memory',
		'spritenum': 676,
		'onMemory': 'Fire',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Fire',
		'num': 912,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Fire type.'
	},
	{
		'id': 'firiumz',
		'name': 'Firium Z',
		'spritenum': 632,
		'onPlate': 'Fire',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Fire',
		'forcedForme': 'Arceus-Fire',
		'num': 777,
		'gen': 7,
		'desc': 'If holder has a Fire move, this item allows it to use a Fire Z-Move.'
	},
	{
		'id': 'fistplate',
		'name': 'Fist Plate',
		'spritenum': 143,
		'onPlate': 'Fighting',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Fighting') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Fighting',
		'num': 303,
		'gen': 4,
		'desc': 'Holder\'s Fighting-type attacks have 1.2x power. Judgment is Fighting type.'
	},
	{
		'id': 'flameorb',
		'name': 'Flame Orb',
		'spritenum': 145,
		'fling': {
			'basePower': 30,
			'status': 'brn'
		},
		'onResidualOrder': 26,
		'onResidualSubOrder': 2,
		'onResidual' (pokemon) {
			pokemon.trySetStatus('brn', pokemon);
		},
		'num': 273,
		'gen': 4,
		'desc': 'At the end of every turn, this item attempts to burn the holder.'
	},
	{
		'id': 'flameplate',
		'name': 'Flame Plate',
		'spritenum': 146,
		'onPlate': 'Fire',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Fire') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Fire',
		'num': 298,
		'gen': 4,
		'desc': 'Holder\'s Fire-type attacks have 1.2x power. Judgment is Fire type.'
	},
	{
		'id': 'floatstone',
		'name': 'Float Stone',
		'spritenum': 147,
		'fling': {
			'basePower': 30
		},
		'onModifyWeight' (weight) {
			return weight / 2;
		},
		'num': 539,
		'gen': 5,
		'desc': 'Holder\'s weight is halved.'
	},
	{
		'id': 'flyinggem',
		'name': 'Flying Gem',
		'isUnreleased': true,
		'spritenum': 149,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Flying') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Flying Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 556,
		'gen': 5,
		'desc': 'Holder\'s first successful Flying-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'flyingmemory',
		'name': 'Flying Memory',
		'spritenum': 669,
		'onMemory': 'Flying',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Flying',
		'num': 905,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Flying type.'
	},
	{
		'id': 'flyiniumz',
		'name': 'Flyinium Z',
		'spritenum': 640,
		'onPlate': 'Flying',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Flying',
		'forcedForme': 'Arceus-Flying',
		'num': 785,
		'gen': 7,
		'desc': 'If holder has a Flying move, this item allows it to use a Flying Z-Move.'
	},
	{
		'id': 'focusband',
		'name': 'Focus Band',
		'spritenum': 150,
		'fling': {
			'basePower': 10
		},
		'onDamage' (damage, target, source, effect) {
			if (this.random(10) === 0 && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-activate', target, 'item: Focus Band');

				return target.hp - 1;
			}
		},
		'num': 230,
		'gen': 2,
		'desc': 'Holder has a 10% chance to survive an attack that would KO it with 1 HP.'
	},
	{
		'id': 'focussash',
		'name': 'Focus Sash',
		'spritenum': 151,
		'fling': {
			'basePower': 10
		},
		'onDamage' (damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				if (target.useItem()) {
					return target.hp - 1;
				}
			}
		},
		'num': 275,
		'gen': 4,
		'desc': 'If holder\'s HP is full, will survive an attack that would KO it with 1 HP. Single use.'
	},
	{
		'id': 'friendball',
		'name': 'Friend Ball',
		'spritenum': 153,
		'num': 497,
		'gen': 2,
		'desc': 'A Poke Ball that makes caught Pokemon more friendly.'
	},
	{
		'id': 'fullincense',
		'name': 'Full Incense',
		'spritenum': 155,
		'fling': {
			'basePower': 10
		},
		'onModifyPriority' (priority, pokemon) {
			return Math.round(priority) - 0.1;
		},
		'num': 316,
		'gen': 4,
		'desc': 'Holder moves last in its priority bracket.'
	},
	{
		'id': 'galladite',
		'name': 'Galladite',
		'spritenum': 616,
		'megaStone': 'Gallade-Mega',
		'megaEvolves': 'Gallade',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 756,
		'gen': 6,
		'desc': 'If held by a Gallade, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'ganlonberry',
		'name': 'Ganlon Berry',
		'spritenum': 158,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Ice'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'def': 1
			});
		},
		'num': 202,
		'gen': 3,
		'desc': 'Raises holder\'s Defense by 1 stage when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'garchompite',
		'name': 'Garchompite',
		'spritenum': 589,
		'megaStone': 'Garchomp-Mega',
		'megaEvolves': 'Garchomp',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 683,
		'gen': 6,
		'desc': 'If held by a Garchomp, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'gardevoirite',
		'name': 'Gardevoirite',
		'spritenum': 587,
		'megaStone': 'Gardevoir-Mega',
		'megaEvolves': 'Gardevoir',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 657,
		'gen': 6,
		'desc': 'If held by a Gardevoir, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'gengarite',
		'name': 'Gengarite',
		'spritenum': 588,
		'megaStone': 'Gengar-Mega',
		'megaEvolves': 'Gengar',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 656,
		'gen': 6,
		'desc': 'If held by a Gengar, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'ghostgem',
		'name': 'Ghost Gem',
		'isUnreleased': true,
		'spritenum': 161,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Ghost') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Ghost Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 560,
		'gen': 5,
		'desc': 'Holder\'s first successful Ghost-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'ghostmemory',
		'name': 'Ghost Memory',
		'spritenum': 674,
		'onMemory': 'Ghost',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Ghost',
		'num': 910,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ghost type.'
	},
	{
		'id': 'ghostiumz',
		'name': 'Ghostium Z',
		'spritenum': 644,
		'onPlate': 'Ghost',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Ghost',
		'forcedForme': 'Arceus-Ghost',
		'num': 789,
		'gen': 7,
		'desc': 'If holder has a Ghost move, this item allows it to use a Ghost Z-Move.'
	},
	{
		'id': 'glalitite',
		'name': 'Glalitite',
		'spritenum': 623,
		'megaStone': 'Glalie-Mega',
		'megaEvolves': 'Glalie',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 763,
		'gen': 6,
		'desc': 'If held by a Glalie, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'grassgem',
		'name': 'Grass Gem',
		'isUnreleased': true,
		'spritenum': 172,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
				return;
			}
			if (move.type === 'Grass') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Grass Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 551,
		'gen': 5,
		'desc': 'Holder\'s first successful Grass-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'grassmemory',
		'name': 'Grass Memory',
		'spritenum': 678,
		'onMemory': 'Grass',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Grass',
		'num': 914,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Grass type.'
	},
	{
		'id': 'grassiumz',
		'name': 'Grassium Z',
		'spritenum': 635,
		'onPlate': 'Grass',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Grass',
		'forcedForme': 'Arceus-Grass',
		'num': 780,
		'gen': 7,
		'desc': 'If holder has a Grass move, this item allows it to use a Grass Z-Move.'
	},
	{
		'id': 'grassyseed',
		'name': 'Grassy Seed',
		'spritenum': 667,
		'fling': {
			'basePower': 10
		},
		'onUpdate' (pokemon) {
			if (this.isTerrain('grassyterrain') && pokemon.useItem()) {
				this.boost({
					'def': 1
				});
			}
		},
		'num': 884,
		'gen': 7,
		'desc': 'If the terrain is Grassy Terrain, raises holder\'s Defense by 1 stage. Single use.'
	},
	{
		'id': 'greatball',
		'name': 'Great Ball',
		'spritenum': 174,
		'num': 3,
		'gen': 1,
		'desc': 'A high-performance Ball that provides a higher catch rate than a Poke Ball.'
	},
	{
		'id': 'grepaberry',
		'name': 'Grepa Berry',
		'spritenum': 178,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Flying'
		},
		'onEat': false,
		'num': 173,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'gripclaw',
		'name': 'Grip Claw',
		'spritenum': 179,
		'fling': {
			'basePower': 90
		},
		// Implemented in statuses
		'num': 286,
		'gen': 4,
		'desc': 'Holder\'s partial-trapping moves always last 7 turns.'
	},
	{
		'id': 'griseousorb',
		'name': 'Griseous Orb',
		'spritenum': 180,
		'fling': {
			'basePower': 60
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (user.baseTemplate.num === 487 && (move.type === 'Ghost' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 487 || pokemon.baseTemplate.num === 487) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Giratina-Origin',
		'num': 112,
		'gen': 4,
		'desc': 'If held by a Giratina, its Ghost- and Dragon-type attacks have 1.2x power.'
	},
	{
		'id': 'groundgem',
		'name': 'Ground Gem',
		'isUnreleased': true,
		'spritenum': 182,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Ground') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Ground Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 555,
		'gen': 5,
		'desc': 'Holder\'s first successful Ground-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'groundmemory',
		'name': 'Ground Memory',
		'spritenum': 671,
		'onMemory': 'Ground',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Ground',
		'num': 907,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ground type.'
	},
	{
		'id': 'groundiumz',
		'name': 'Groundium Z',
		'spritenum': 639,
		'onPlate': 'Ground',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Ground',
		'forcedForme': 'Arceus-Ground',
		'num': 784,
		'gen': 7,
		'desc': 'If holder has a Ground move, this item allows it to use a Ground Z-Move.'
	},
	{
		'id': 'gyaradosite',
		'name': 'Gyaradosite',
		'spritenum': 589,
		'megaStone': 'Gyarados-Mega',
		'megaEvolves': 'Gyarados',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 676,
		'gen': 6,
		'desc': 'If held by a Gyarados, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'habanberry',
		'name': 'Haban Berry',
		'spritenum': 185,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Dragon'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Dragon' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 197,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Dragon-type attack. Single use.'
	},
	{
		'id': 'hardstone',
		'name': 'Hard Stone',
		'spritenum': 187,
		'fling': {
			'basePower': 100
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Rock') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 238,
		'gen': 2,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power.'
	},
	{
		'id': 'healball',
		'name': 'Heal Ball',
		'spritenum': 188,
		'num': 14,
		'gen': 4,
		'desc': 'A remedial Poke Ball that restores the caught Pokemon\'s HP and status problem.'
	},
	{
		'id': 'heatrock',
		'name': 'Heat Rock',
		'spritenum': 193,
		'fling': {
			'basePower': 60
		},
		'num': 284,
		'gen': 4,
		'desc': 'Holder\'s use of Sunny Day lasts 8 turns instead of 5.'
	},
	{
		'id': 'heavyball',
		'name': 'Heavy Ball',
		'spritenum': 194,
		'num': 495,
		'gen': 2,
		'desc': 'A Poke Ball for catching very heavy Pokemon.'
	},
	{
		'id': 'helixfossil',
		'name': 'Helix Fossil',
		'spritenum': 195,
		'fling': {
			'basePower': 100
		},
		'num': 101,
		'gen': 3,
		'desc': 'Can be revived into Omanyte.'
	},
	{
		'id': 'heracronite',
		'name': 'Heracronite',
		'spritenum': 590,
		'megaStone': 'Heracross-Mega',
		'megaEvolves': 'Heracross',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 680,
		'gen': 6,
		'desc': 'If held by a Heracross, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'hondewberry',
		'name': 'Hondew Berry',
		'spritenum': 213,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Ground'
		},
		'onEat': false,
		'num': 172,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'houndoominite',
		'name': 'Houndoominite',
		'spritenum': 591,
		'megaStone': 'Houndoom-Mega',
		'megaEvolves': 'Houndoom',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 666,
		'gen': 6,
		'desc': 'If held by a Houndoom, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'iapapaberry',
		'name': 'Iapapa Berry',
		'spritenum': 217,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Dark'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'def') {
				pokemon.addVolatile('confusion');
			}
		},
		'num': 163,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.'
	},
	{
		'id': 'icegem',
		'name': 'Ice Gem',
		'isUnreleased': true,
		'spritenum': 218,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Ice') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Ice Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 552,
		'gen': 5,
		'desc': 'Holder\'s first successful Ice-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'icememory',
		'name': 'Ice Memory',
		'spritenum': 681,
		'onMemory': 'Ice',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Ice',
		'num': 917,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Ice type.'
	},
	{
		'id': 'icicleplate',
		'name': 'Icicle Plate',
		'spritenum': 220,
		'onPlate': 'Ice',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Ice') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Ice',
		'num': 302,
		'gen': 4,
		'desc': 'Holder\'s Ice-type attacks have 1.2x power. Judgment is Ice type.'
	},
	{
		'id': 'iciumz',
		'name': 'Icium Z',
		'spritenum': 636,
		'onPlate': 'Ice',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Ice',
		'forcedForme': 'Arceus-Ice',
		'num': 781,
		'gen': 7,
		'desc': 'If holder has an Ice move, this item allows it to use an Ice Z-Move.'
	},
	{
		'id': 'icyrock',
		'name': 'Icy Rock',
		'spritenum': 221,
		'fling': {
			'basePower': 40
		},
		'num': 282,
		'gen': 4,
		'desc': 'Holder\'s use of Hail lasts 8 turns instead of 5.'
	},
	{
		'id': 'inciniumz',
		'name': 'Incinium Z',
		'spritenum': 651,
		'onTakeItem': false,
		'zMove': 'Malicious Moonsault',
		'zMoveFrom': 'Darkest Lariat',
		'zMoveUser': ['Incineroar'],
		'num': 799,
		'gen': 7,
		'desc': 'If held by an Incineroar with Darkest Lariat, it can use Malicious Moonsault.'
	},
	{
		'id': 'insectplate',
		'name': 'Insect Plate',
		'spritenum': 223,
		'onPlate': 'Bug',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Bug') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Bug',
		'num': 308,
		'gen': 4,
		'desc': 'Holder\'s Bug-type attacks have 1.2x power. Judgment is Bug type.'
	},
	{
		'id': 'ironball',
		'name': 'Iron Ball',
		'spritenum': 224,
		'fling': {
			'basePower': 130
		},
		'onEffectiveness' (typeMod, target, type, move) {
			if (target.volatiles.ingrain || target.volatiles.smackdown || this.getPseudoWeather('gravity')) {
				return;
			}
			if (move.type === 'Ground' && target.hasType('Flying')) {
				return 0;
			}
		},
		// Airborneness negation implemented in sim/pokemon.js:Pokemon#isGrounded
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 278,
		'gen': 4,
		'desc': 'Holder is grounded, Speed halved. If Flying type, takes neutral Ground damage.'
	},
	{
		'id': 'ironplate',
		'name': 'Iron Plate',
		'spritenum': 225,
		'onPlate': 'Steel',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Steel') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Steel',
		'num': 313,
		'gen': 4,
		'desc': 'Holder\'s Steel-type attacks have 1.2x power. Judgment is Steel type.'
	},
	{
		'id': 'jabocaberry',
		'name': 'Jaboca Berry',
		'isUnreleased': true,
		'spritenum': 230,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Dragon'
		},
		'onAfterDamage' (damage, target, source, move) {
			if (source && source !== target && move && move.category === 'Physical') {
				if (target.eatItem()) {
					this.damage(source.maxhp / 8, source, target);
				}
			}
		},
		'onEat' () {},
		'num': 211,
		'gen': 4,
		'desc': 'If holder is hit by a physical move, attacker loses 1/8 of its max HP. Single use.'
	},
	{
		'id': 'kasibberry',
		'name': 'Kasib Berry',
		'spritenum': 233,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ghost'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Ghost' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 196,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ghost-type attack. Single use.'
	},
	{
		'id': 'kebiaberry',
		'name': 'Kebia Berry',
		'spritenum': 234,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Poison'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Poison' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 190,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Poison-type attack. Single use.'
	},
	{
		'id': 'keeberry',
		'name': 'Kee Berry',
		'spritenum': 593,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Fairy'
		},
		'onAfterMoveSecondary' (target, source, move) {
			if (move.category === 'Physical') {
				target.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'def': 1
			});
		},
		'num': 687,
		'gen': 6,
		'desc': 'Raises holder\'s Defense by 1 stage after it is hit by a physical attack. Single use.'
	},
	{
		'id': 'kelpsyberry',
		'name': 'Kelpsy Berry',
		'spritenum': 235,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Fighting'
		},
		'onEat': false,
		'num': 170,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'kangaskhanite',
		'name': 'Kangaskhanite',
		'spritenum': 592,
		'megaStone': 'Kangaskhan-Mega',
		'megaEvolves': 'Kangaskhan',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 675,
		'gen': 6,
		'desc': 'If held by a Kangaskhan, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'kingsrock',
		'name': 'King\'s Rock',
		'spritenum': 236,
		'fling': {
			'basePower': 30,
			'volatileStatus': 'flinch'
		},
		'onModifyMovePriority': -1,
		'onModifyMove' (move) {
			if (move.category !== 'Status') {
				if (!move.secondaries) {
					move.secondaries = [];
				}
				for (let i = 0; i < move.secondaries.length; i++) {
					if (move.secondaries[i].volatileStatus === 'flinch') {
						return;
					}
				}
				move.secondaries.push({
					'chance': 10,
					'volatileStatus': 'flinch'
				});
			}
		},
		'num': 221,
		'gen': 2,
		'desc': 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
	},
	{
		'id': 'kommoniumz',
		'name': 'Kommonium Z',
		'spritenum': 690,
		'onTakeItem': false,
		'zMove': 'Clangorous Soulblaze',
		'zMoveFrom': 'Clanging Scales',
		'zMoveUser': ['Kommo-o', 'Kommo-o-Totem'],
		'num': 926,
		'gen': 7,
		'desc': 'If held by a Kommo-o with Clanging Scales, it can use Clangorous Soulblaze.'
	},
	{
		'id': 'laggingtail',
		'name': 'Lagging Tail',
		'spritenum': 237,
		'fling': {
			'basePower': 10
		},
		'onModifyPriority' (priority, pokemon) {
			return Math.round(priority) - 0.1;
		},
		'num': 279,
		'gen': 4,
		'desc': 'Holder moves last in its priority bracket.'
	},
	{
		'id': 'lansatberry',
		'name': 'Lansat Berry',
		'spritenum': 238,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Flying'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.addVolatile('focusenergy');
		},
		'num': 206,
		'gen': 3,
		'desc': 'Holder gains the Focus Energy effect when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'latiasite',
		'name': 'Latiasite',
		'spritenum': 629,
		'megaStone': 'Latias-Mega',
		'megaEvolves': 'Latias',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 684,
		'gen': 6,
		'desc': 'If held by a Latias, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'latiosite',
		'name': 'Latiosite',
		'spritenum': 630,
		'megaStone': 'Latios-Mega',
		'megaEvolves': 'Latios',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 685,
		'gen': 6,
		'desc': 'If held by a Latios, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'laxincense',
		'name': 'Lax Incense',
		'spritenum': 240,
		'fling': {
			'basePower': 10
		},
		'onModifyAccuracy' (accuracy) {
			if (typeof accuracy !== 'number') {
				return;
			}
			this.debug('lax incense - decreasing accuracy');

			return accuracy * 0.9;
		},
		'num': 255,
		'gen': 3,
		'desc': 'The accuracy of attacks against the holder is 0.9x.'
	},
	{
		'id': 'leftovers',
		'name': 'Leftovers',
		'spritenum': 242,
		'fling': {
			'basePower': 10
		},
		'onResidualOrder': 5,
		'onResidualSubOrder': 2,
		'onResidual' (pokemon) {
			if (this.isTerrain('grassyterrain')) {
				return;
			}
			this.heal(pokemon.maxhp / 16);
		},
		'onTerrain' (pokemon) {
			if (!this.isTerrain('grassyterrain')) {
				return;
			}
			this.heal(pokemon.maxhp / 16);
		},
		'num': 234,
		'gen': 2,
		'desc': 'At the end of every turn, holder restores 1/16 of its max HP.'
	},
	{
		'id': 'leppaberry',
		'name': 'Leppa Berry',
		'spritenum': 244,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fighting'
		},
		'onUpdate' (pokemon) {
			if (!pokemon.hp) {
				return;
			}
			const moveSlot = pokemon.lastMove && pokemon.getMoveData(pokemon.lastMove.id);

			if (moveSlot && moveSlot.pp === 0) {
				pokemon.addVolatile('leppaberry');
				pokemon.volatiles.leppaberry.moveSlot = moveSlot;
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			let moveSlot;

			if (pokemon.volatiles.leppaberry) {
				moveSlot = pokemon.volatiles.leppaberry.moveSlot;
				pokemon.removeVolatile('leppaberry');
			} else {
				let pp = 99;

				for (const possibleMoveSlot of pokemon.moveSlots) {
					if (possibleMoveSlot.pp < pp) {
						moveSlot = possibleMoveSlot;
						pp = moveSlot.pp;
					}
				}
			}
			moveSlot.pp += 10;
			if (moveSlot.pp > moveSlot.maxpp) {
				moveSlot.pp = moveSlot.maxpp;
			}
			this.add('-activate', pokemon, 'item: Leppa Berry', moveSlot.move, '[consumed]');
			if (pokemon.item !== 'leppaberry') {
				const foeActive = pokemon.side.foe.active;
				let foeIsStale = false;

				for (let i = 0; i < foeActive.length; i++) {
					if (foeActive[i].hp && foeActive[i].isStale >= 2) {
						foeIsStale = true;
						break;
					}
				}
				if (!foeIsStale) {
					return;
				}
			}
			pokemon.isStale = 2;
			pokemon.isStaleSource = 'useleppa';
		},
		'num': 154,
		'gen': 3,
		'desc': 'Restores 10 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
	},
	{
		'id': 'levelball',
		'name': 'Level Ball',
		'spritenum': 246,
		'num': 493,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon that are a lower level than your own.'
	},
	{
		'id': 'liechiberry',
		'name': 'Liechi Berry',
		'spritenum': 248,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Grass'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'atk': 1
			});
		},
		'num': 201,
		'gen': 3,
		'desc': 'Raises holder\'s Attack by 1 stage when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'lifeorb',
		'name': 'Life Orb',
		'spritenum': 249,
		'fling': {
			'basePower': 30
		},
		'onModifyDamage' (damage, source, target, move) {
			return this.chainModify([0x14CC, 0x1000]);
		},
		'onAfterMoveSecondarySelf' (source, target, move) {
			if (source && source !== target && move && move.category !== 'Status' && !move.ohko) {
				this.damage(source.maxhp / 10, source, source, this.getItem('lifeorb'));
			}
		},
		'num': 270,
		'gen': 4,
		'desc': 'Holder\'s attacks do 1.3x damage, and it loses 1/10 its max HP after the attack.'
	},
	{
		'id': 'lightball',
		'name': 'Light Ball',
		'spritenum': 251,
		'fling': {
			'basePower': 30,
			'status': 'par'
		},
		'onModifyAtkPriority': 1,
		'onModifyAtk' (atk, pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu') {
				return this.chainModify(2);
			}
		},
		'onModifySpAPriority': 1,
		'onModifySpA' (spa, pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu') {
				return this.chainModify(2);
			}
		},
		'num': 236,
		'gen': 2,
		'desc': 'If held by a Pikachu, its Attack and Sp. Atk are doubled.'
	},
	{
		'id': 'lightclay',
		'name': 'Light Clay',
		'spritenum': 252,
		'fling': {
			'basePower': 30
		},
		// Implemented in the corresponding thing
		'num': 269,
		'gen': 4,
		'desc': 'Holder\'s use of Aurora Veil, Light Screen, or Reflect lasts 8 turns instead of 5.'
	},
	{
		'id': 'lopunnite',
		'name': 'Lopunnite',
		'spritenum': 626,
		'megaStone': 'Lopunny-Mega',
		'megaEvolves': 'Lopunny',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 768,
		'gen': 6,
		'desc': 'If held by a Lopunny, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'loveball',
		'name': 'Love Ball',
		'spritenum': 258,
		'num': 496,
		'gen': 2,
		'desc': 'Poke Ball for catching Pokemon that are the opposite gender of your Pokemon.'
	},
	{
		'id': 'lucarionite',
		'name': 'Lucarionite',
		'spritenum': 594,
		'megaStone': 'Lucario-Mega',
		'megaEvolves': 'Lucario',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 673,
		'gen': 6,
		'desc': 'If held by a Lucario, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'luckypunch',
		'name': 'Lucky Punch',
		'spritenum': 261,
		'fling': {
			'basePower': 40
		},
		'onModifyCritRatio' (critRatio, user) {
			if (user.baseTemplate.species === 'Chansey') {
				return critRatio + 2;
			}
		},
		'num': 256,
		'gen': 2,
		'desc': 'If held by a Chansey, its critical hit ratio is raised by 2 stages.'
	},
	{
		'id': 'lumberry',
		'name': 'Lum Berry',
		'spritenum': 262,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Flying'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status || pokemon.volatiles.confusion) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.cureStatus();
			pokemon.removeVolatile('confusion');
		},
		'num': 157,
		'gen': 3,
		'desc': 'Holder cures itself if it is confused or has a major status condition. Single use.'
	},
	{
		'id': 'luminousmoss',
		'name': 'Luminous Moss',
		'spritenum': 595,
		'fling': {
			'basePower': 30
		},
		'onAfterDamage' (damage, target, source, move) {
			if (move.type === 'Water' && target.useItem()) {
				this.boost({
					'spd': 1
				});
			}
		},
		'num': 648,
		'gen': 6,
		'desc': 'Raises holder\'s Sp. Def by 1 stage if hit by a Water-type attack. Single use.'
	},
	{
		'id': 'lunaliumz',
		'name': 'Lunalium Z',
		'spritenum': 686,
		'onTakeItem': false,
		'zMove': 'Menacing Moonraze Maelstrom',
		'zMoveFrom': 'Moongeist Beam',
		'zMoveUser': ['Lunala', 'Necrozma-Dawn-Wings'],
		'num': 922,
		'gen': 7,
		'desc': 'Lunala or Dawn Wings Necrozma with Moongeist Beam can use a special Z-Move.'
	},
	{
		'id': 'lureball',
		'name': 'Lure Ball',
		'spritenum': 264,
		'num': 494,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon hooked by a Rod when fishing.'
	},
	{
		'id': 'lustrousorb',
		'name': 'Lustrous Orb',
		'spritenum': 265,
		'fling': {
			'basePower': 60
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && user.baseTemplate.species === 'Palkia' && (move.type === 'Water' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 136,
		'gen': 4,
		'desc': 'If held by a Palkia, its Water- and Dragon-type attacks have 1.2x power.'
	},
	{
		'id': 'luxuryball',
		'name': 'Luxury Ball',
		'spritenum': 266,
		'num': 11,
		'gen': 3,
		'desc': 'A comfortable Poke Ball that makes a caught wild Pokemon quickly grow friendly.'
	},
	{
		'id': 'lycaniumz',
		'name': 'Lycanium Z',
		'spritenum': 689,
		'onTakeItem': false,
		'zMove': 'Splintered Stormshards',
		'zMoveFrom': 'Stone Edge',
		'zMoveUser': ['Lycanroc', 'Lycanroc-Midnight', 'Lycanroc-Dusk'],
		'num': 925,
		'gen': 7,
		'desc': 'If held by a Lycanroc forme with Stone Edge, it can use Splintered Stormshards.'
	},
	{
		'id': 'machobrace',
		'name': 'Macho Brace',
		'isUnreleased': true,
		'spritenum': 269,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 60
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 215,
		'gen': 3,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'magnet',
		'name': 'Magnet',
		'spritenum': 273,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Electric') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 242,
		'gen': 2,
		'desc': 'Holder\'s Electric-type attacks have 1.2x power.'
	},
	{
		'id': 'magoberry',
		'name': 'Mago Berry',
		'spritenum': 274,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ghost'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spe') {
				pokemon.addVolatile('confusion');
			}
		},
		'num': 161,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -Spe Nature. Single use.'
	},
	{
		'id': 'magostberry',
		'name': 'Magost Berry',
		'isUnreleased': true,
		'spritenum': 275,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Rock'
		},
		'onEat': false,
		'num': 176,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'mail',
		'name': 'Mail',
		'spritenum': 403,
		'onTakeItem' (item, source) {
			if (!this.activeMove) {
				return false;
			}
			if (this.activeMove.id !== 'knockoff' && this.activeMove.id !== 'thief' && this.activeMove.id !== 'covet') {
				return false;
			}
		},
		'isUnreleased': true,
		'gen': 2,
		'desc': 'Cannot be given to or taken from a Pokemon, except by Covet/Knock Off/Thief.'
	},
	{
		'id': 'manectite',
		'name': 'Manectite',
		'spritenum': 596,
		'megaStone': 'Manectric-Mega',
		'megaEvolves': 'Manectric',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 682,
		'gen': 6,
		'desc': 'If held by a Manectric, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'marangaberry',
		'name': 'Maranga Berry',
		'spritenum': 597,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Dark'
		},
		'onAfterMoveSecondary' (target, source, move) {
			if (move.category === 'Special') {
				target.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'spd': 1
			});
		},
		'num': 688,
		'gen': 6,
		'desc': 'Raises holder\'s Sp. Def by 1 stage after it is hit by a special attack. Single use.'
	},
	{
		'id': 'marshadiumz',
		'name': 'Marshadium Z',
		'spritenum': 654,
		'onTakeItem': false,
		'zMove': 'Soul-Stealing 7-Star Strike',
		'zMoveFrom': 'Spectral Thief',
		'zMoveUser': ['Marshadow'],
		'num': 802,
		'gen': 7,
		'desc': 'If held by Marshadow with Spectral Thief, it can use Soul-Stealing 7-Star Strike.'
	},
	{
		'id': 'masterball',
		'name': 'Master Ball',
		'spritenum': 276,
		'num': 1,
		'gen': 1,
		'desc': 'The best Ball with the ultimate performance. It will catch any wild Pokemon.'
	},
	{
		'id': 'mawilite',
		'name': 'Mawilite',
		'spritenum': 598,
		'megaStone': 'Mawile-Mega',
		'megaEvolves': 'Mawile',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 681,
		'gen': 6,
		'desc': 'If held by a Mawile, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'meadowplate',
		'name': 'Meadow Plate',
		'spritenum': 282,
		'onPlate': 'Grass',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Grass') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Grass',
		'num': 301,
		'gen': 4,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power. Judgment is Grass type.'
	},
	{
		'id': 'medichamite',
		'name': 'Medichamite',
		'spritenum': 599,
		'megaStone': 'Medicham-Mega',
		'megaEvolves': 'Medicham',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 665,
		'gen': 6,
		'desc': 'If held by a Medicham, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'mentalherb',
		'name': 'Mental Herb',
		'spritenum': 285,
		'fling': {
			'basePower': 10,
			'effect' (pokemon) {
				const conditions = ['attract', 'taunt', 'encore', 'torment', 'disable', 'healblock'];

				for (let i = 0; i < conditions.length; i++) {
					if (pokemon.volatiles[conditions[i]]) {
						for (let j = 0; j < conditions.length; j++) {
							pokemon.removeVolatile(conditions[j]);
							if (conditions[i] === 'attract' && conditions[j] === 'attract') {
								this.add('-end', pokemon, 'move: Attract', '[from] item: Mental Herb');
							}
						}

						return;
					}
				}
			}
		},
		'onUpdate' (pokemon) {
			const conditions = ['attract', 'taunt', 'encore', 'torment', 'disable', 'healblock'];

			for (let i = 0; i < conditions.length; i++) {
				if (pokemon.volatiles[conditions[i]]) {
					if (!pokemon.useItem()) {
						return;
					}
					for (let j = 0; j < conditions.length; j++) {
						pokemon.removeVolatile(conditions[j]);
						if (conditions[i] === 'attract' && conditions[j] === 'attract') {
							this.add('-end', pokemon, 'move: Attract', '[from] item: Mental Herb');
						}
					}

					return;
				}
			}
		},
		'num': 219,
		'gen': 3,
		'desc': 'Cures holder of Attract, Disable, Encore, Heal Block, Taunt, Torment. Single use.'
	},
	{
		'id': 'metagrossite',
		'name': 'Metagrossite',
		'spritenum': 618,
		'megaStone': 'Metagross-Mega',
		'megaEvolves': 'Metagross',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 758,
		'gen': 6,
		'desc': 'If held by a Metagross, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'metalcoat',
		'name': 'Metal Coat',
		'spritenum': 286,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Steel') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 233,
		'gen': 2,
		'desc': 'Holder\'s Steel-type attacks have 1.2x power.'
	},
	{
		'id': 'metalpowder',
		'name': 'Metal Powder',
		'fling': {
			'basePower': 10
		},
		'spritenum': 287,
		'onModifyDefPriority': 2,
		'onModifyDef' (def, pokemon) {
			if (pokemon.template.species === 'Ditto' && !pokemon.transformed) {
				return this.chainModify(2);
			}
		},
		'num': 257,
		'gen': 2,
		'desc': 'If held by a Ditto that hasn\'t Transformed, its Defense is doubled.'
	},
	{
		'id': 'metronome',
		'name': 'Metronome',
		'spritenum': 289,
		'fling': {
			'basePower': 30
		},
		'onStart' (pokemon) {
			pokemon.addVolatile('metronome');
		},
		'effect': {
			'onStart' (pokemon) {
				this.effectData.numConsecutive = 0;
				this.effectData.lastMove = '';
			},
			'onBeforeMove' (pokemon, target, move) {
				if (!pokemon.hasItem('metronome')) {
					pokemon.removeVolatile('metronome');

					return;
				}
				if (this.effectData.lastMove === move.id) {
					this.effectData.numConsecutive++;
				} else {
					this.effectData.numConsecutive = 0;
				}
				this.effectData.lastMove = move.id;
			},
			'onModifyDamage' (damage, source, target, move) {
				const numConsecutive = this.effectData.numConsecutive > 5 ? 5 : this.effectData.numConsecutive;
				const dmgMod = [0x1000, 0x1333, 0x1666, 0x1999, 0x1CCC, 0x2000];


				return this.chainModify([dmgMod[numConsecutive], 0x1000]);
			}
		},
		'num': 277,
		'gen': 4,
		'desc': 'Damage of moves used on consecutive turns is increased. Max 2x after 5 turns.'
	},
	{
		'id': 'mewniumz',
		'name': 'Mewnium Z',
		'spritenum': 658,
		'onTakeItem': false,
		'zMove': 'Genesis Supernova',
		'zMoveFrom': 'Psychic',
		'zMoveUser': ['Mew'],
		'num': 806,
		'gen': 7,
		'desc': 'If held by a Mew with Psychic, it can use Genesis Supernova.'
	},
	{
		'id': 'mewtwonitex',
		'name': 'Mewtwonite X',
		'spritenum': 600,
		'megaStone': 'Mewtwo-Mega-X',
		'megaEvolves': 'Mewtwo',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 662,
		'gen': 6,
		'desc': 'If held by a Mewtwo, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'mewtwonitey',
		'name': 'Mewtwonite Y',
		'spritenum': 601,
		'megaStone': 'Mewtwo-Mega-Y',
		'megaEvolves': 'Mewtwo',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 663,
		'gen': 6,
		'desc': 'If held by a Mewtwo, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'micleberry',
		'name': 'Micle Berry',
		'isUnreleased': true,
		'spritenum': 290,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Rock'
		},
		'onResidual' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.addVolatile('micleberry');
		},
		'effect': {
			'duration': 2,
			'onSourceModifyAccuracy' (accuracy, target, source) {
				this.add('-enditem', source, 'Micle Berry');
				source.removeVolatile('micleberry');
				if (typeof accuracy === 'number') {
					return accuracy * 1.2;
				}
			}
		},
		'num': 209,
		'gen': 4,
		'desc': 'Holder\'s next move has 1.2x accuracy when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'mimikiumz',
		'name': 'Mimikium Z',
		'spritenum': 688,
		'onTakeItem': false,
		'zMove': 'Let\'s Snuggle Forever',
		'zMoveFrom': 'Play Rough',
		'zMoveUser': ['Mimikyu', 'Mimikyu-Busted', 'Mimikyu-Totem', 'Mimikyu-Busted-Totem'],
		'num': 924,
		'gen': 7,
		'desc': 'If held by a Mimikyu with Play Rough, it can use Let\'s Snuggle Forever.'
	},
	{
		'id': 'mindplate',
		'name': 'Mind Plate',
		'spritenum': 291,
		'onPlate': 'Psychic',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Psychic',
		'num': 307,
		'gen': 4,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power. Judgment is Psychic type.'
	},
	{
		'id': 'miracleseed',
		'name': 'Miracle Seed',
		'fling': {
			'basePower': 30
		},
		'spritenum': 292,
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Grass') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 239,
		'gen': 2,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power.'
	},
	{
		'id': 'mistyseed',
		'name': 'Misty Seed',
		'spritenum': 666,
		'fling': {
			'basePower': 10
		},
		'onUpdate' (pokemon) {
			if (this.isTerrain('mistyterrain') && pokemon.useItem()) {
				this.boost({
					'spd': 1
				});
			}
		},
		'num': 883,
		'gen': 7,
		'desc': 'If the terrain is Misty Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
	},
	{
		'id': 'moonball',
		'name': 'Moon Ball',
		'spritenum': 294,
		'num': 498,
		'gen': 2,
		'desc': 'A Poke Ball for catching Pokemon that evolve using the Moon Stone.'
	},
	{
		'id': 'muscleband',
		'name': 'Muscle Band',
		'spritenum': 297,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.category === 'Physical') {
				return this.chainModify([0x1199, 0x1000]);
			}
		},
		'num': 266,
		'gen': 4,
		'desc': 'Holder\'s physical attacks have 1.1x power.'
	},
	{
		'id': 'mysticwater',
		'name': 'Mystic Water',
		'spritenum': 300,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Water') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 243,
		'gen': 2,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	{
		'id': 'nanabberry',
		'name': 'Nanab Berry',
		'isUnreleased': true,
		'spritenum': 302,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Water'
		},
		'onEat': false,
		'num': 166,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'nestball',
		'name': 'Nest Ball',
		'spritenum': 303,
		'num': 8,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on weaker Pokemon in the wild.'
	},
	{
		'id': 'netball',
		'name': 'Net Ball',
		'spritenum': 304,
		'num': 6,
		'gen': 3,
		'desc': 'A Poke Ball that works especially well on Water- and Bug-type Pokemon.'
	},
	{
		'id': 'nevermeltice',
		'name': 'Never-Melt Ice',
		'spritenum': 305,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Ice') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 246,
		'gen': 2,
		'desc': 'Holder\'s Ice-type attacks have 1.2x power.'
	},
	{
		'id': 'nomelberry',
		'name': 'Nomel Berry',
		'isUnreleased': true,
		'spritenum': 306,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Dragon'
		},
		'onEat': false,
		'num': 178,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'normalgem',
		'name': 'Normal Gem',
		'spritenum': 307,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
				return;
			}
			if (move.type === 'Normal') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Normal Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 564,
		'gen': 5,
		'desc': 'Holder\'s first successful Normal-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'normaliumz',
		'name': 'Normalium Z',
		'spritenum': 631,
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Normal',
		'num': 776,
		'gen': 7,
		'desc': 'If holder has a Normal move, this item allows it to use a Normal Z-Move.'
	},
	{
		'id': 'occaberry',
		'name': 'Occa Berry',
		'spritenum': 311,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fire'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Fire' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 184,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Fire-type attack. Single use.'
	},
	{
		'id': 'oddincense',
		'name': 'Odd Incense',
		'spritenum': 312,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 314,
		'gen': 4,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power.'
	},
	{
		'id': 'oldamber',
		'name': 'Old Amber',
		'spritenum': 314,
		'fling': {
			'basePower': 100
		},
		'num': 103,
		'gen': 3,
		'desc': 'Can be revived into Aerodactyl.'
	},
	{
		'id': 'oranberry',
		'name': 'Oran Berry',
		'spritenum': 319,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Poison'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(10);
		},
		'num': 155,
		'gen': 3,
		'desc': 'Restores 10 HP when at 1/2 max HP or less. Single use.'
	},
	{
		'id': 'pamtreberry',
		'name': 'Pamtre Berry',
		'isUnreleased': true,
		'spritenum': 323,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Steel'
		},
		'onEat': false,
		'num': 180,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'parkball',
		'name': 'Park Ball',
		'spritenum': 325,
		'num': 500,
		'gen': 4,
		'desc': 'A special Poke Ball for the Pal Park.'
	},
	{
		'id': 'passhoberry',
		'name': 'Passho Berry',
		'spritenum': 329,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Water'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Water' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 185,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Water-type attack. Single use.'
	},
	{
		'id': 'payapaberry',
		'name': 'Payapa Berry',
		'spritenum': 330,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Psychic'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Psychic' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 193,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Psychic-type attack. Single use.'
	},
	{
		'id': 'pechaberry',
		'name': 'Pecha Berry',
		'spritenum': 333,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Electric'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.cureStatus();
			}
		},
		'num': 151,
		'gen': 3,
		'desc': 'Holder is cured if it is poisoned. Single use.'
	},
	{
		'id': 'persimberry',
		'name': 'Persim Berry',
		'spritenum': 334,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ground'
		},
		'onUpdate' (pokemon) {
			if (pokemon.volatiles.confusion) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.removeVolatile('confusion');
		},
		'num': 156,
		'gen': 3,
		'desc': 'Holder is cured if it is confused. Single use.'
	},
	{
		'id': 'petayaberry',
		'name': 'Petaya Berry',
		'spritenum': 335,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Poison'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'spa': 1
			});
		},
		'num': 204,
		'gen': 3,
		'desc': 'Raises holder\'s Sp. Atk by 1 stage when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'pidgeotite',
		'name': 'Pidgeotite',
		'spritenum': 622,
		'megaStone': 'Pidgeot-Mega',
		'megaEvolves': 'Pidgeot',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 762,
		'gen': 6,
		'desc': 'If held by a Pidgeot, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'pikaniumz',
		'name': 'Pikanium Z',
		'spritenum': 649,
		'onTakeItem': false,
		'zMove': 'Catastropika',
		'zMoveFrom': 'Volt Tackle',
		'zMoveUser': ['Pikachu'],
		'num': 794,
		'gen': 7,
		'desc': 'If held by a Pikachu with Volt Tackle, it can use Catastropika.'
	},
	{
		'id': 'pikashuniumz',
		'name': 'Pikashunium Z',
		'spritenum': 659,
		'onTakeItem': false,
		'zMove': '10,000,000 Volt Thunderbolt',
		'zMoveFrom': 'Thunderbolt',
		'zMoveUser': ['Pikachu-Original', 'Pikachu-Hoenn', 'Pikachu-Sinnoh', 'Pikachu-Unova', 'Pikachu-Kalos', 'Pikachu-Alola', 'Pikachu-Partner'],
		'num': 836,
		'gen': 7,
		'desc': 'If held by cap Pikachu with Thunderbolt, it can use 10,000,000 Volt Thunderbolt.'
	},
	{
		'id': 'pinapberry',
		'name': 'Pinap Berry',
		'spritenum': 337,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Grass'
		},
		'onEat': false,
		'num': 168,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'pinsirite',
		'name': 'Pinsirite',
		'spritenum': 602,
		'megaStone': 'Pinsir-Mega',
		'megaEvolves': 'Pinsir',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 671,
		'gen': 6,
		'desc': 'If held by a Pinsir, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'pixieplate',
		'name': 'Pixie Plate',
		'spritenum': 610,
		'onPlate': 'Fairy',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Fairy') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Fairy',
		'num': 644,
		'gen': 6,
		'desc': 'Holder\'s Fairy-type attacks have 1.2x power. Judgment is Fairy type.'
	},
	{
		'id': 'plumefossil',
		'name': 'Plume Fossil',
		'spritenum': 339,
		'fling': {
			'basePower': 100
		},
		'num': 573,
		'gen': 5,
		'desc': 'Can be revived into Archen.'
	},
	{
		'id': 'poisonbarb',
		'name': 'Poison Barb',
		'spritenum': 343,
		'fling': {
			'basePower': 70,
			'status': 'psn'
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Poison') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 245,
		'gen': 2,
		'desc': 'Holder\'s Poison-type attacks have 1.2x power.'
	},
	{
		'id': 'poisongem',
		'name': 'Poison Gem',
		'isUnreleased': true,
		'spritenum': 344,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Poison') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Poison Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 554,
		'gen': 5,
		'desc': 'Holder\'s first successful Poison-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'poisonmemory',
		'name': 'Poison Memory',
		'spritenum': 670,
		'onMemory': 'Poison',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Poison',
		'num': 906,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Poison type.'
	},
	{
		'id': 'poisoniumz',
		'name': 'Poisonium Z',
		'spritenum': 638,
		'onPlate': 'Poison',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Poison',
		'forcedForme': 'Arceus-Poison',
		'num': 783,
		'gen': 7,
		'desc': 'If holder has a Poison move, this item allows it to use a Poison Z-Move.'
	},
	{
		'id': 'pokeball',
		'name': 'Poke Ball',
		'spritenum': 345,
		'num': 4,
		'gen': 1,
		'desc': 'A device for catching wild Pokemon. It is designed as a capsule system.'
	},
	{
		'id': 'pomegberry',
		'name': 'Pomeg Berry',
		'spritenum': 351,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Ice'
		},
		'onEat': false,
		'num': 169,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'poweranklet',
		'name': 'Power Anklet',
		'spritenum': 354,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 293,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'powerband',
		'name': 'Power Band',
		'spritenum': 355,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 292,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'powerbelt',
		'name': 'Power Belt',
		'spritenum': 356,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 290,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'powerbracer',
		'name': 'Power Bracer',
		'spritenum': 357,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 289,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'powerherb',
		'onChargeMove' (pokemon, target, move) {
			if (pokemon.useItem()) {
				this.debug(`power herb - remove charge turn for ${move.id}`);

				return false; // Skip charge turn
			}
		},
		'name': 'Power Herb',
		'spritenum': 358,
		'fling': {
			'basePower': 10
		},
		'num': 271,
		'gen': 4,
		'desc': 'Holder\'s two-turn moves complete in one turn (except Sky Drop). Single use.'
	},
	{
		'id': 'powerlens',
		'name': 'Power Lens',
		'spritenum': 359,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 291,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'powerweight',
		'name': 'Power Weight',
		'spritenum': 360,
		'ignoreKlutz': true,
		'fling': {
			'basePower': 70
		},
		'onModifySpe' (spe) {
			return this.chainModify(0.5);
		},
		'num': 294,
		'gen': 4,
		'desc': 'Holder\'s Speed is halved. The Ability Klutz does not ignore this effect.'
	},
	{
		'id': 'premierball',
		'name': 'Premier Ball',
		'spritenum': 363,
		'num': 12,
		'gen': 3,
		'desc': 'A rare Poke Ball that has been crafted to commemorate an event.'
	},
	{
		'id': 'primariumz',
		'name': 'Primarium Z',
		'spritenum': 652,
		'onTakeItem': false,
		'zMove': 'Oceanic Operetta',
		'zMoveFrom': 'Sparkling Aria',
		'zMoveUser': ['Primarina'],
		'num': 800,
		'gen': 7,
		'desc': 'If held by a Primarina with Sparkling Aria, it can use Oceanic Operetta.'
	},
	{
		'id': 'protectivepads',
		'name': 'Protective Pads',
		'spritenum': 663,
		'fling': {
			'basePower': 30
		},
		'onModifyMove' (move) {
			delete move.flags.contact;
		},
		'num': 880,
		'gen': 7,
		'desc': 'Holder\'s attacks do not make contact with the target.'
	},
	{
		'id': 'psychicgem',
		'name': 'Psychic Gem',
		'isUnreleased': true,
		'spritenum': 369,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Psychic') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Psychic Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 557,
		'gen': 5,
		'desc': 'Holder\'s first successful Psychic-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'psychicmemory',
		'name': 'Psychic Memory',
		'spritenum': 680,
		'onMemory': 'Psychic',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Psychic',
		'num': 916,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Psychic type.'
	},
	{
		'id': 'psychicseed',
		'name': 'Psychic Seed',
		'spritenum': 665,
		'fling': {
			'basePower': 10
		},
		'onUpdate' (pokemon) {
			if (this.isTerrain('psychicterrain') && pokemon.useItem()) {
				this.boost({
					'spd': 1
				});
			}
		},
		'num': 882,
		'gen': 7,
		'desc': 'If the terrain is Psychic Terrain, raises holder\'s Sp. Def by 1 stage. Single use.'
	},
	{
		'id': 'psychiumz',
		'name': 'Psychium Z',
		'spritenum': 641,
		'onPlate': 'Psychic',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Psychic',
		'forcedForme': 'Arceus-Psychic',
		'num': 786,
		'gen': 7,
		'desc': 'If holder has a Psychic move, this item allows it to use a Psychic Z-Move.'
	},
	{
		'id': 'qualotberry',
		'name': 'Qualot Berry',
		'spritenum': 371,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Poison'
		},
		'onEat': false,
		'num': 171,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'quickball',
		'name': 'Quick Ball',
		'spritenum': 372,
		'num': 15,
		'gen': 4,
		'desc': 'A Poke Ball that provides a better catch rate at the start of a wild encounter.'
	},
	{
		'id': 'quickclaw',
		'onModifyPriorityPriority': -1,
		'onModifyPriority' (priority, pokemon) {
			if (this.random(5) === 0) {
				this.add('-activate', pokemon, 'item: Quick Claw');

				return Math.round(priority) + 0.1;
			}
		},
		'name': 'Quick Claw',
		'spritenum': 373,
		'fling': {
			'basePower': 80
		},
		'num': 217,
		'gen': 2,
		'desc': 'Each turn, holder has a 20% chance to move first in its priority bracket.'
	},
	{
		'id': 'quickpowder',
		'name': 'Quick Powder',
		'spritenum': 374,
		'fling': {
			'basePower': 10
		},
		'onModifySpe' (spe, pokemon) {
			if (pokemon.template.species === 'Ditto' && !pokemon.transformed) {
				return this.chainModify(2);
			}
		},
		'num': 274,
		'gen': 4,
		'desc': 'If held by a Ditto that hasn\'t Transformed, its Speed is doubled.'
	},
	{
		'id': 'rabutaberry',
		'name': 'Rabuta Berry',
		'isUnreleased': true,
		'spritenum': 375,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Ghost'
		},
		'onEat': false,
		'num': 177,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'rarebone',
		'name': 'Rare Bone',
		'spritenum': 379,
		'fling': {
			'basePower': 100
		},
		'num': 106,
		'gen': 4,
		'desc': 'No competitive use other than when used with Fling.'
	},
	{
		'id': 'rawstberry',
		'name': 'Rawst Berry',
		'spritenum': 381,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Grass'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.cureStatus();
			}
		},
		'num': 152,
		'gen': 3,
		'desc': 'Holder is cured if it is burned. Single use.'
	},
	{
		'id': 'razorclaw',
		'name': 'Razor Claw',
		'spritenum': 382,
		'fling': {
			'basePower': 80
		},
		'onModifyCritRatio' (critRatio) {
			return critRatio + 1;
		},
		'num': 326,
		'gen': 4,
		'desc': 'Holder\'s critical hit ratio is raised by 1 stage.'
	},
	{
		'id': 'razorfang',
		'name': 'Razor Fang',
		'spritenum': 383,
		'fling': {
			'basePower': 30,
			'volatileStatus': 'flinch'
		},
		'onModifyMovePriority': -1,
		'onModifyMove' (move) {
			if (move.category !== 'Status') {
				if (!move.secondaries) {
					move.secondaries = [];
				}
				for (let i = 0; i < move.secondaries.length; i++) {
					if (move.secondaries[i].volatileStatus === 'flinch') {
						return;
					}
				}
				move.secondaries.push({
					'chance': 10,
					'volatileStatus': 'flinch'
				});
			}
		},
		'num': 327,
		'gen': 4,
		'desc': 'Holder\'s attacks without a chance to flinch gain a 10% chance to flinch.'
	},
	{
		'id': 'razzberry',
		'name': 'Razz Berry',
		'isUnreleased': true,
		'spritenum': 384,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Steel'
		},
		'onEat': false,
		'num': 164,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'redcard',
		'name': 'Red Card',
		'spritenum': 387,
		'fling': {
			'basePower': 10
		},
		'onAfterMoveSecondary' (target, source, move) {
			if (source && source !== target && source.hp && target.hp && move && move.category !== 'Status') {
				if (!source.isActive || !this.canSwitch(source.side) || source.forceSwitchFlag || target.forceSwitchFlag) {
					return;
				}
				if (target.useItem(source)) { // This order is correct - the item is used up even against a pokemon with Ingrain or that otherwise can't be forced out
					if (this.runEvent('DragOut', source, target, move)) {
						source.forceSwitchFlag = true;
					}
				}
			}
		},
		'num': 542,
		'gen': 5,
		'desc': 'If holder survives a hit, attacker is forced to switch to a random ally. Single use.'
	},
	{
		'id': 'redorb',
		'name': 'Red Orb',
		'spritenum': 390,
		'onSwitchIn' (pokemon) {
			if (pokemon.isActive && pokemon.baseTemplate.species === 'Groudon') {
				this.insertQueue({
					pokemon,
					'choice': 'runPrimal'
				});
			}
		},
		'onPrimal' (pokemon) {
			const template = this.getTemplate('Groudon-Primal');

			pokemon.formeChange(template);
			pokemon.baseTemplate = template;
			pokemon.details = template.species + (pokemon.level === 100 ? '' : `, L${pokemon.level}`) + (pokemon.gender === '' ? '' : `, ${pokemon.gender}`) + (pokemon.set.shiny ? ', shiny' : '');
			if (pokemon.illusion) {
				pokemon.ability = ''; // Don't allow Illusion to wear off
				this.add('-primal', pokemon.illusion);
			} else {
				this.add('detailschange', pokemon, pokemon.details);
				this.add('-primal', pokemon);
			}
			pokemon.setAbility(template.abilities['0'], null, true);
			pokemon.baseAbility = pokemon.ability;
		},
		'onTakeItem' (item, source) {
			if (source.baseTemplate.baseSpecies === 'Groudon') {
				return false;
			}

			return true;
		},
		'num': 534,
		'gen': 6,
		'desc': 'If held by a Groudon, this item triggers its Primal Reversion in battle.'
	},
	{
		'id': 'repeatball',
		'name': 'Repeat Ball',
		'spritenum': 401,
		'num': 9,
		'gen': 3,
		'desc': 'A Poke Ball that works well on Pokemon species that were previously caught.'
	},
	{
		'id': 'rindoberry',
		'name': 'Rindo Berry',
		'spritenum': 409,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Grass'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Grass' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 187,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Grass-type attack. Single use.'
	},
	{
		'id': 'ringtarget',
		'name': 'Ring Target',
		'spritenum': 410,
		'fling': {
			'basePower': 10
		},
		'onNegateImmunity': false,
		'num': 543,
		'gen': 5,
		'desc': 'The holder\'s type immunities granted solely by its typing are negated.'
	},
	{
		'id': 'rockgem',
		'name': 'Rock Gem',
		'isUnreleased': true,
		'spritenum': 415,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Rock') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Rock Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 559,
		'gen': 5,
		'desc': 'Holder\'s first successful Rock-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'rockincense',
		'name': 'Rock Incense',
		'spritenum': 416,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Rock') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 315,
		'gen': 4,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power.'
	},
	{
		'id': 'rockmemory',
		'name': 'Rock Memory',
		'spritenum': 672,
		'onMemory': 'Rock',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Rock',
		'num': 908,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Rock type.'
	},
	{
		'id': 'rockiumz',
		'name': 'Rockium Z',
		'spritenum': 643,
		'onPlate': 'Rock',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Rock',
		'forcedForme': 'Arceus-Rock',
		'num': 788,
		'gen': 7,
		'desc': 'If holder has a Rock move, this item allows it to use a Rock Z-Move.'
	},
	{
		'id': 'rockyhelmet',
		'name': 'Rocky Helmet',
		'spritenum': 417,
		'fling': {
			'basePower': 60
		},
		'onAfterDamageOrder': 2,
		'onAfterDamage' (damage, target, source, move) {
			if (source && source !== target && move && move.flags.contact) {
				this.damage(source.maxhp / 6, source, target);
			}
		},
		'num': 540,
		'gen': 5,
		'desc': 'If holder is hit by a contact move, the attacker loses 1/6 of its max HP.'
	},
	{
		'id': 'rootfossil',
		'name': 'Root Fossil',
		'spritenum': 418,
		'fling': {
			'basePower': 100
		},
		'num': 99,
		'gen': 3,
		'desc': 'Can be revived into Lileep.'
	},
	{
		'id': 'roseincense',
		'name': 'Rose Incense',
		'spritenum': 419,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Grass') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 318,
		'gen': 4,
		'desc': 'Holder\'s Grass-type attacks have 1.2x power.'
	},
	{
		'id': 'roseliberry',
		'name': 'Roseli Berry',
		'spritenum': 603,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fairy'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Fairy' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 686,
		'gen': 6,
		'desc': 'Halves damage taken from a supereffective Fairy-type attack. Single use.'
	},
	{
		'id': 'rowapberry',
		'name': 'Rowap Berry',
		'isUnreleased': true,
		'spritenum': 420,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Dark'
		},
		'onAfterDamage' (damage, target, source, move) {
			if (source && source !== target && move && move.category === 'Special') {
				if (target.eatItem()) {
					this.damage(source.maxhp / 8, source, target);
				}
			}
		},
		'onEat' () {},
		'num': 212,
		'gen': 4,
		'desc': 'If holder is hit by a special move, attacker loses 1/8 of its max HP. Single use.'
	},
	{
		'id': 'sablenite',
		'name': 'Sablenite',
		'spritenum': 614,
		'megaStone': 'Sableye-Mega',
		'megaEvolves': 'Sableye',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 754,
		'gen': 6,
		'desc': 'If held by a Sableye, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'safariball',
		'name': 'Safari Ball',
		'spritenum': 425,
		'num': 5,
		'gen': 1,
		'desc': 'A special Poke Ball that is used only in the Safari Zone and Great Marsh.'
	},
	{
		'id': 'safetygoggles',
		'name': 'Safety Goggles',
		'spritenum': 604,
		'fling': {
			'basePower': 80
		},
		'onImmunity' (type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') {
				return false;
			}
		},
		'onTryHit' (pokemon, source, move) {
			if (move.flags.powder && pokemon !== source && this.getImmunity('powder', pokemon)) {
				this.add('-activate', pokemon, 'item: Safety Goggles', move.name);

				return null;
			}
		},
		'num': 650,
		'gen': 6,
		'desc': 'Holder is immune to powder moves and damage from Sandstorm or Hail.'
	},
	{
		'id': 'salacberry',
		'name': 'Salac Berry',
		'spritenum': 426,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Fighting'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			this.boost({
				'spe': 1
			});
		},
		'num': 203,
		'gen': 3,
		'desc': 'Raises holder\'s Speed by 1 stage when at 1/4 max HP or less. Single use.'
	},
	{
		'id': 'salamencite',
		'name': 'Salamencite',
		'spritenum': 627,
		'megaStone': 'Salamence-Mega',
		'megaEvolves': 'Salamence',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 769,
		'gen': 6,
		'desc': 'If held by a Salamence, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'sceptilite',
		'name': 'Sceptilite',
		'spritenum': 613,
		'megaStone': 'Sceptile-Mega',
		'megaEvolves': 'Sceptile',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 753,
		'gen': 6,
		'desc': 'If held by a Sceptile, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'scizorite',
		'name': 'Scizorite',
		'spritenum': 605,
		'megaStone': 'Scizor-Mega',
		'megaEvolves': 'Scizor',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 670,
		'gen': 6,
		'desc': 'If held by a Scizor, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'scopelens',
		'name': 'Scope Lens',
		'spritenum': 429,
		'fling': {
			'basePower': 30
		},
		'onModifyCritRatio' (critRatio) {
			return critRatio + 1;
		},
		'num': 232,
		'gen': 2,
		'desc': 'Holder\'s critical hit ratio is raised by 1 stage.'
	},
	{
		'id': 'seaincense',
		'name': 'Sea Incense',
		'spritenum': 430,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Water') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 254,
		'gen': 3,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	{
		'id': 'sharpbeak',
		'name': 'Sharp Beak',
		'spritenum': 436,
		'fling': {
			'basePower': 50
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && move.type === 'Flying') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 244,
		'gen': 2,
		'desc': 'Holder\'s Flying-type attacks have 1.2x power.'
	},
	{
		'id': 'sharpedonite',
		'name': 'Sharpedonite',
		'spritenum': 619,
		'megaStone': 'Sharpedo-Mega',
		'megaEvolves': 'Sharpedo',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 759,
		'gen': 6,
		'desc': 'If held by a Sharpedo, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'shedshell',
		'name': 'Shed Shell',
		'spritenum': 437,
		'fling': {
			'basePower': 10
		},
		'onTrapPokemonPriority': -10,
		'onTrapPokemon' (pokemon) {
			pokemon.trapped = pokemon.maybeTrapped = false;
		},
		'num': 295,
		'gen': 4,
		'desc': 'Holder may switch out even when trapped by another Pokemon, or by Ingrain.'
	},
	{
		'id': 'shellbell',
		'name': 'Shell Bell',
		'spritenum': 438,
		'fling': {
			'basePower': 30
		},
		'onAfterMoveSecondarySelfPriority': -1,
		'onAfterMoveSecondarySelf' (pokemon, target, move) {
			if (move.category !== 'Status') {
				this.heal(pokemon.lastDamage / 8, pokemon);
			}
		},
		'num': 253,
		'gen': 3,
		'desc': 'After an attack, holder gains 1/8 of the damage in HP dealt to other Pokemon.'
	},
	{
		'id': 'shockdrive',
		'name': 'Shock Drive',
		'spritenum': 442,
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 649 || pokemon.baseTemplate.num === 649) {
				return false;
			}

			return true;
		},
		'onDrive': 'Electric',
		'forcedForme': 'Genesect-Shock',
		'num': 117,
		'gen': 5,
		'desc': 'Holder\'s Techno Blast is Electric type.'
	},
	{
		'id': 'shucaberry',
		'name': 'Shuca Berry',
		'spritenum': 443,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ground'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Ground' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 191,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ground-type attack. Single use.'
	},
	{
		'id': 'silkscarf',
		'name': 'Silk Scarf',
		'spritenum': 444,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Normal') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 251,
		'gen': 3,
		'desc': 'Holder\'s Normal-type attacks have 1.2x power.'
	},
	{
		'id': 'silverpowder',
		'name': 'SilverPowder',
		'spritenum': 447,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Bug') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 222,
		'gen': 2,
		'desc': 'Holder\'s Bug-type attacks have 1.2x power.'
	},
	{
		'id': 'sitrusberry',
		'name': 'Sitrus Berry',
		'spritenum': 448,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Psychic'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 4);
		},
		'num': 158,
		'gen': 3,
		'desc': 'Restores 1/4 max HP when at 1/2 max HP or less. Single use.'
	},
	{
		'id': 'skullfossil',
		'name': 'Skull Fossil',
		'spritenum': 449,
		'fling': {
			'basePower': 100
		},
		'num': 105,
		'gen': 4,
		'desc': 'Can be revived into Cranidos.'
	},
	{
		'id': 'skyplate',
		'name': 'Sky Plate',
		'spritenum': 450,
		'onPlate': 'Flying',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Flying') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Flying',
		'num': 306,
		'gen': 4,
		'desc': 'Holder\'s Flying-type attacks have 1.2x power. Judgment is Flying type.'
	},
	{
		'id': 'slowbronite',
		'name': 'Slowbronite',
		'spritenum': 620,
		'megaStone': 'Slowbro-Mega',
		'megaEvolves': 'Slowbro',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 760,
		'gen': 6,
		'desc': 'If held by a Slowbro, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'smoothrock',
		'name': 'Smooth Rock',
		'spritenum': 453,
		'fling': {
			'basePower': 10
		},
		'num': 283,
		'gen': 4,
		'desc': 'Holder\'s use of Sandstorm lasts 8 turns instead of 5.'
	},
	{
		'id': 'snorliumz',
		'name': 'Snorlium Z',
		'spritenum': 656,
		'onTakeItem': false,
		'zMove': 'Pulverizing Pancake',
		'zMoveFrom': 'Giga Impact',
		'zMoveUser': ['Snorlax'],
		'num': 804,
		'gen': 7,
		'desc': 'If held by a Snorlax with Giga Impact, it can use Pulverizing Pancake.'
	},
	{
		'id': 'snowball',
		'name': 'Snowball',
		'spritenum': 606,
		'fling': {
			'basePower': 30
		},
		'onAfterDamage' (damage, target, source, move) {
			if (move.type === 'Ice' && target.useItem()) {
				this.boost({
					'atk': 1
				});
			}
		},
		'num': 649,
		'gen': 6,
		'desc': 'Raises holder\'s Attack by 1 if hit by an Ice-type attack. Single use.'
	},
	{
		'id': 'softsand',
		'name': 'Soft Sand',
		'spritenum': 456,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Ground') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 237,
		'gen': 2,
		'desc': 'Holder\'s Ground-type attacks have 1.2x power.'
	},
	{
		'id': 'solganiumz',
		'name': 'Solganium Z',
		'spritenum': 685,
		'onTakeItem': false,
		'zMove': 'Searing Sunraze Smash',
		'zMoveFrom': 'Sunsteel Strike',
		'zMoveUser': ['Solgaleo', 'Necrozma-Dusk-Mane'],
		'num': 921,
		'gen': 7,
		'desc': 'Solgaleo or Dusk Mane Necrozma with Sunsteel Strike can use a special Z-Move.'
	},
	{
		'id': 'souldew',
		'name': 'Soul Dew',
		'spritenum': 459,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move && (user.baseTemplate.num === 380 || user.baseTemplate.num === 381) && (move.type === 'Psychic' || move.type === 'Dragon')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 225,
		'gen': 3,
		'desc': 'If held by a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.'
	},
	{
		'id': 'spelltag',
		'name': 'Spell Tag',
		'spritenum': 461,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Ghost') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 247,
		'gen': 2,
		'desc': 'Holder\'s Ghost-type attacks have 1.2x power.'
	},
	{
		'id': 'spelonberry',
		'name': 'Spelon Berry',
		'isUnreleased': true,
		'spritenum': 462,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Dark'
		},
		'onEat': false,
		'num': 179,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'splashplate',
		'name': 'Splash Plate',
		'spritenum': 463,
		'onPlate': 'Water',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Water') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Water',
		'num': 299,
		'gen': 4,
		'desc': 'Holder\'s Water-type attacks have 1.2x power. Judgment is Water type.'
	},
	{
		'id': 'spookyplate',
		'name': 'Spooky Plate',
		'spritenum': 464,
		'onPlate': 'Ghost',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Ghost') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Ghost',
		'num': 310,
		'gen': 4,
		'desc': 'Holder\'s Ghost-type attacks have 1.2x power. Judgment is Ghost type.'
	},
	{
		'id': 'sportball',
		'name': 'Sport Ball',
		'spritenum': 465,
		'num': 499,
		'gen': 2,
		'desc': 'A special Poke Ball for the Bug-Catching Contest.'
	},
	{
		'id': 'starfberry',
		'name': 'Starf Berry',
		'spritenum': 472,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Psychic'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			const stats = [];

			for (const stat in pokemon.boosts) {
				if (stat !== 'accuracy' && stat !== 'evasion' && pokemon.boosts[stat] < 6) {
					stats.push(stat);
				}
			}
			if (stats.length) {
				const randomStat = stats[this.random(stats.length)];
				const boost = {};

				boost[randomStat] = 2;
				this.boost(boost);
			}
		},
		'num': 207,
		'gen': 3,
		'desc': 'Raises a random stat by 2 when at 1/4 max HP or less (not acc/eva). Single use.'
	},
	{
		'id': 'steelixite',
		'name': 'Steelixite',
		'spritenum': 621,
		'megaStone': 'Steelix-Mega',
		'megaEvolves': 'Steelix',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 761,
		'gen': 6,
		'desc': 'If held by a Steelix, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'steelgem',
		'name': 'Steel Gem',
		'isUnreleased': true,
		'spritenum': 473,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status') {
				return;
			}
			if (move.type === 'Steel') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Steel Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 563,
		'gen': 5,
		'desc': 'Holder\'s first successful Steel-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'steelmemory',
		'name': 'Steel Memory',
		'spritenum': 675,
		'onMemory': 'Steel',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Steel',
		'num': 911,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Steel type.'
	},
	{
		'id': 'steeliumz',
		'name': 'Steelium Z',
		'spritenum': 647,
		'onPlate': 'Steel',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Steel',
		'forcedForme': 'Arceus-Steel',
		'num': 792,
		'gen': 7,
		'desc': 'If holder has a Steel move, this item allows it to use a Steel Z-Move.'
	},
	{
		'id': 'stick',
		'name': 'Stick',
		'fling': {
			'basePower': 60
		},
		'spritenum': 475,
		'onModifyCritRatio' (critRatio, user) {
			if (user.baseTemplate.species === 'Farfetch\'d') {
				return critRatio + 2;
			}
		},
		'num': 259,
		'gen': 2,
		'desc': 'If held by a Farfetch\'d, its critical hit ratio is raised by 2 stages.'
	},
	{
		'id': 'stickybarb',
		'name': 'Sticky Barb',
		'spritenum': 476,
		'fling': {
			'basePower': 80
		},
		'onResidualOrder': 26,
		'onResidualSubOrder': 2,
		'onResidual' (pokemon) {
			this.damage(pokemon.maxhp / 8);
		},
		'onHit' (target, source, move) {
			if (source && source !== target && !source.item && move && move.flags.contact) {
				const barb = target.takeItem();

				source.setItem(barb);
				// No message for Sticky Barb changing hands
			}
		},
		'num': 288,
		'gen': 4,
		'desc': 'Each turn, holder loses 1/8 max HP. An attacker making contact can receive it.'
	},
	{
		'id': 'stoneplate',
		'name': 'Stone Plate',
		'spritenum': 477,
		'onPlate': 'Rock',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Rock') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Rock',
		'num': 309,
		'gen': 4,
		'desc': 'Holder\'s Rock-type attacks have 1.2x power. Judgment is Rock type.'
	},
	{
		'id': 'swampertite',
		'name': 'Swampertite',
		'spritenum': 612,
		'megaStone': 'Swampert-Mega',
		'megaEvolves': 'Swampert',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 752,
		'gen': 6,
		'desc': 'If held by a Swampert, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'tamatoberry',
		'name': 'Tamato Berry',
		'spritenum': 486,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Psychic'
		},
		'onEat': false,
		'num': 174,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'tangaberry',
		'name': 'Tanga Berry',
		'spritenum': 487,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Bug'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Bug' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 194,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Bug-type attack. Single use.'
	},
	{
		'id': 'tapuniumz',
		'name': 'Tapunium Z',
		'spritenum': 653,
		'onTakeItem': false,
		'zMove': 'Guardian of Alola',
		'zMoveFrom': 'Nature\'s Madness',
		'zMoveUser': ['Tapu Koko', 'Tapu Lele', 'Tapu Bulu', 'Tapu Fini'],
		'num': 801,
		'gen': 7,
		'desc': 'If held by a Tapu with Nature\'s Madness, it can use Guardian of Alola.'
	},
	{
		'id': 'terrainextender',
		'name': 'Terrain Extender',
		'spritenum': 662,
		'fling': {
			'basePower': 60
		},
		'num': 879,
		'gen': 7,
		'desc': 'Holder\'s use of Electric/Grassy/Misty/Psychic Terrain lasts 8 turns instead of 5.'
	},
	{
		'id': 'thickclub',
		'name': 'Thick Club',
		'spritenum': 491,
		'fling': {
			'basePower': 90
		},
		'onModifyAtkPriority': 1,
		'onModifyAtk' (atk, pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Cubone' || pokemon.baseTemplate.baseSpecies === 'Marowak') {
				return this.chainModify(2);
			}
		},
		'num': 258,
		'gen': 2,
		'desc': 'If held by a Cubone or a Marowak, its Attack is doubled.'
	},
	{
		'id': 'timerball',
		'name': 'Timer Ball',
		'spritenum': 494,
		'num': 10,
		'gen': 3,
		'desc': 'A Poke Ball that becomes better the more turns there are in a battle.'
	},
	{
		'id': 'toxicorb',
		'name': 'Toxic Orb',
		'spritenum': 515,
		'fling': {
			'basePower': 30,
			'status': 'tox'
		},
		'onResidualOrder': 26,
		'onResidualSubOrder': 2,
		'onResidual' (pokemon) {
			pokemon.trySetStatus('tox', pokemon);
		},
		'num': 272,
		'gen': 4,
		'desc': 'At the end of every turn, this item attempts to badly poison the holder.'
	},
	{
		'id': 'toxicplate',
		'name': 'Toxic Plate',
		'spritenum': 516,
		'onPlate': 'Poison',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Poison') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Poison',
		'num': 304,
		'gen': 4,
		'desc': 'Holder\'s Poison-type attacks have 1.2x power. Judgment is Poison type.'
	},
	{
		'id': 'twistedspoon',
		'name': 'Twisted Spoon',
		'spritenum': 520,
		'fling': {
			'basePower': 30
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Psychic') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 248,
		'gen': 2,
		'desc': 'Holder\'s Psychic-type attacks have 1.2x power.'
	},
	{
		'id': 'tyranitarite',
		'name': 'Tyranitarite',
		'spritenum': 607,
		'megaStone': 'Tyranitar-Mega',
		'megaEvolves': 'Tyranitar',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 669,
		'gen': 6,
		'desc': 'If held by a Tyranitar, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'ultraball',
		'name': 'Ultra Ball',
		'spritenum': 521,
		'num': 2,
		'gen': 1,
		'desc': 'An ultra-performance Ball that provides a higher catch rate than a Great Ball.'
	},
	{
		'id': 'ultranecroziumz',
		'name': 'Ultranecrozium Z',
		'spritenum': 687,
		'onTakeItem': false,
		'zMove': 'Light That Burns the Sky',
		'zMoveFrom': 'Photon Geyser',
		'zMoveUser': ['Necrozma-Ultra'],
		'num': 923,
		'gen': 7,
		'desc': 'Dusk Mane/Dawn Wings Necrozma: Ultra Burst, then Z-Move w/ Photon Geyser.'
	},
	{
		'id': 'venusaurite',
		'name': 'Venusaurite',
		'spritenum': 608,
		'megaStone': 'Venusaur-Mega',
		'megaEvolves': 'Venusaur',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': 659,
		'gen': 6,
		'desc': 'If held by a Venusaur, this item allows it to Mega Evolve in battle.'
	},
	{
		'id': 'wacanberry',
		'name': 'Wacan Berry',
		'spritenum': 526,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Electric'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Electric' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 186,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Electric-type attack. Single use.'
	},
	{
		'id': 'watergem',
		'name': 'Water Gem',
		'isUnreleased': true,
		'spritenum': 528,
		'isGem': true,
		'onSourceTryPrimaryHit' (target, source, move) {
			if (target === source || move.category === 'Status' || ['firepledge', 'grasspledge', 'waterpledge'].includes(move.id)) {
				return;
			}
			if (move.type === 'Water') {
				if (source.useItem()) {
					this.add('-enditem', source, 'Water Gem', '[from] gem', `[move] ${move.name}`);
					source.addVolatile('gem');
				}
			}
		},
		'num': 549,
		'gen': 5,
		'desc': 'Holder\'s first successful Water-type attack will have 1.3x power. Single use.'
	},
	{
		'id': 'watermemory',
		'name': 'Water Memory',
		'spritenum': 677,
		'onMemory': 'Water',
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 773 || pokemon.baseTemplate.num === 773) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Silvally-Water',
		'num': 913,
		'gen': 7,
		'desc': 'Holder\'s Multi-Attack is Water type.'
	},
	{
		'id': 'wateriumz',
		'name': 'Waterium Z',
		'spritenum': 633,
		'onPlate': 'Water',
		'onTakeItem': false,
		'zMove': true,
		'zMoveType': 'Water',
		'forcedForme': 'Arceus-Water',
		'num': 778,
		'gen': 7,
		'desc': 'If holder has a Water move, this item allows it to use a Water Z-Move.'
	},
	{
		'id': 'watmelberry',
		'name': 'Watmel Berry',
		'isUnreleased': true,
		'spritenum': 530,
		'isBerry': true,
		'naturalGift': {
			'basePower': 100,
			'type': 'Fire'
		},
		'onEat': false,
		'num': 181,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'waveincense',
		'name': 'Wave Incense',
		'spritenum': 531,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Water') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'num': 317,
		'gen': 4,
		'desc': 'Holder\'s Water-type attacks have 1.2x power.'
	},
	{
		'id': 'weaknesspolicy',
		'name': 'Weakness Policy',
		'spritenum': 609,
		'fling': {
			'basePower': 80
		},
		'onHitPriority': 1,
		'onHit' (target, source, move) {
			if (target.hp && move.category !== 'Status' && !move.damage && !move.damageCallback && move.typeMod > 0 && target.useItem()) {
				this.boost({
					'atk': 2,
					'spa': 2
				});
			}
		},
		'num': 639,
		'gen': 6,
		'desc': 'If holder is hit super effectively, raises Attack, Sp. Atk by 2 stages. Single use.'
	},
	{
		'id': 'wepearberry',
		'name': 'Wepear Berry',
		'isUnreleased': true,
		'spritenum': 533,
		'isBerry': true,
		'naturalGift': {
			'basePower': 90,
			'type': 'Electric'
		},
		'onEat': false,
		'num': 167,
		'gen': 3,
		'desc': 'Cannot be eaten by the holder. No effect when eaten with Bug Bite or Pluck.'
	},
	{
		'id': 'whiteherb',
		'name': 'White Herb',
		'spritenum': 535,
		'fling': {
			'basePower': 10,
			'effect' (pokemon) {
				let activate = false;
				const boosts = {};

				for (const i in pokemon.boosts) {
					if (pokemon.boosts[i] < 0) {
						activate = true;
						boosts[i] = 0;
					}
				}
				if (activate) {
					pokemon.setBoost(boosts);
					this.add('-clearnegativeboost', pokemon, '[silent]');
				}
			}
		},
		'onUpdate' (pokemon) {
			let activate = false;
			const boosts = {};

			for (const i in pokemon.boosts) {
				if (pokemon.boosts[i] < 0) {
					activate = true;
					boosts[i] = 0;
				}
			}
			if (activate && pokemon.useItem()) {
				pokemon.setBoost(boosts);
				this.add('-clearnegativeboost', pokemon, '[silent]');
			}
		},
		'num': 214,
		'gen': 3,
		'desc': 'Restores all lowered stat stages to 0 when one is less than 0. Single use.'
	},
	{
		'id': 'widelens',
		'name': 'Wide Lens',
		'spritenum': 537,
		'fling': {
			'basePower': 10
		},
		'onSourceModifyAccuracy' (accuracy) {
			if (typeof accuracy === 'number') {
				return accuracy * 1.1;
			}
		},
		'num': 265,
		'gen': 4,
		'desc': 'The accuracy of attacks by the holder is 1.1x.'
	},
	{
		'id': 'wikiberry',
		'name': 'Wiki Berry',
		'spritenum': 538,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Rock'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spa') {
				pokemon.addVolatile('confusion');
			}
		},
		'num': 160,
		'gen': 3,
		'desc': 'Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.'
	},
	{
		'id': 'wiseglasses',
		'name': 'Wise Glasses',
		'spritenum': 539,
		'fling': {
			'basePower': 10
		},
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.category === 'Special') {
				return this.chainModify([0x1199, 0x1000]);
			}
		},
		'num': 267,
		'gen': 4,
		'desc': 'Holder\'s special attacks have 1.1x power.'
	},
	{
		'id': 'yacheberry',
		'name': 'Yache Berry',
		'spritenum': 567,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ice'
		},
		'onSourceModifyDamage' (damage, source, target, move) {
			if (move.type === 'Ice' && move.typeMod > 0 && (!target.volatiles.substitute || move.flags.authentic || move.infiltrates && this.gen >= 6)) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');

					return this.chainModify(0.5);
				}
			}
		},
		'onEat' () {},
		'num': 188,
		'gen': 4,
		'desc': 'Halves damage taken from a supereffective Ice-type attack. Single use.'
	},
	{
		'id': 'zapplate',
		'name': 'Zap Plate',
		'spritenum': 572,
		'onPlate': 'Electric',
		'onBasePowerPriority': 6,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Electric') {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		'onTakeItem' (item, pokemon, source) {
			if (source && source.baseTemplate.num === 493 || pokemon.baseTemplate.num === 493) {
				return false;
			}

			return true;
		},
		'forcedForme': 'Arceus-Electric',
		'num': 300,
		'gen': 4,
		'desc': 'Holder\'s Electric-type attacks have 1.2x power. Judgment is Electric type.'
	},
	{
		'id': 'zoomlens',
		'name': 'Zoom Lens',
		'spritenum': 574,
		'fling': {
			'basePower': 10
		},
		'onSourceModifyAccuracy' (accuracy, target) {
			if (typeof accuracy === 'number' && !this.willMove(target)) {
				this.debug('Zoom Lens boosting accuracy');

				return accuracy * 1.2;
			}
		},
		'num': 276,
		'gen': 4,
		'desc': 'The accuracy of attacks by the holder is 1.2x if it moves after its target.'
	},

	// Gen 2 items

	{
		'id': 'berserkgene',
		'name': 'Berserk Gene',
		'spritenum': 388,
		'onUpdate' (pokemon) {
			this.boost({
				'atk': 2
			});
			pokemon.addVolatile('confusion');
			pokemon.setItem('');
		},
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) On switch-in, raises holder\'s Attack by 2 and confuses it. Single use.'
	},
	{
		'id': 'berry',
		'name': 'Berry',
		'spritenum': 319,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Poison'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(10);
		},
		'num': 155,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 10 HP when at 1/2 max HP or less. Single use.'
	},
	{
		'id': 'bitterberry',
		'name': 'Bitter Berry',
		'spritenum': 334,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ground'
		},
		'onUpdate' (pokemon) {
			if (pokemon.volatiles.confusion) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.removeVolatile('confusion');
		},
		'num': 156,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is confused. Single use.'
	},
	{
		'id': 'burntberry',
		'name': 'Burnt Berry',
		'spritenum': 13,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Ice'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'frz') {
				pokemon.cureStatus();
			}
		},
		'num': 153,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is frozen. Single use.'
	},
	{
		'id': 'dragonscale',
		'name': 'Dragon Scale',
		'spritenum': 108,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Dragon') {
				return basePower * 1.1;
			}
		},
		'num': 250,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Dragon-type attacks have 1.1x power. Evolves Seadra (trade).'
	},
	{
		'id': 'goldberry',
		'name': 'Gold Berry',
		'spritenum': 448,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Psychic'
		},
		'onUpdate' (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		'onTryEatItem' (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) {
				return false;
			}
		},
		'onEat' (pokemon) {
			this.heal(30);
		},
		'num': 158,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 30 HP when at 1/2 max HP or less. Single use.'
	},
	{
		'id': 'iceberry',
		'name': 'Ice Berry',
		'spritenum': 381,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Grass'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'brn') {
				pokemon.cureStatus();
			}
		},
		'num': 152,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is burned. Single use.'
	},
	{
		'id': 'mintberry',
		'name': 'Mint Berry',
		'spritenum': 65,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Water'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'slp') {
				pokemon.cureStatus();
			}
		},
		'num': 150,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder wakes up if it is asleep. Single use.'
	},
	{
		'id': 'miracleberry',
		'name': 'Miracle Berry',
		'spritenum': 262,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Flying'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status || pokemon.volatiles.confusion) {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			pokemon.cureStatus();
			pokemon.removeVolatile('confusion');
		},
		'num': 157,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder cures itself if it is confused or has a status condition. Single use.'
	},
	{
		'id': 'mysteryberry',
		'name': 'Mystery Berry',
		'spritenum': 244,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fighting'
		},
		'onUpdate' (pokemon) {
			const moveSlot = pokemon.lastMove && pokemon.getMoveData(pokemon.lastMove.id);

			if (moveSlot && moveSlot.pp === 0) {
				pokemon.addVolatile('leppaberry');
				pokemon.volatiles.leppaberry.moveSlot = moveSlot;
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			let moveSlot;

			if (pokemon.volatiles.leppaberry) {
				moveSlot = pokemon.volatiles.leppaberry.moveSlot;
				pokemon.removeVolatile('leppaberry');
			} else {
				let pp = 99;

				for (const possibleMoveSlot of pokemon.moveSlots) {
					if (possibleMoveSlot.pp < pp) {
						moveSlot = possibleMoveSlot;
						pp = moveSlot.pp;
					}
				}
			}
			moveSlot.pp += 5;
			if (moveSlot.pp > moveSlot.maxpp) {
				moveSlot.pp = moveSlot.maxpp;
			}
			this.add('-activate', pokemon, 'item: Leppa Berry', moveSlot.move);
			if (pokemon.item !== 'leppaberry') {
				const foeActive = pokemon.side.foe.active;
				let foeIsStale = false;

				for (let i = 0; i < 1; i++) {
					if (foeActive.isStale >= 2) {
						foeIsStale = true;
						break;
					}
				}
				if (!foeIsStale) {
					return;
				}
			}
			pokemon.isStale = 2;
			pokemon.isStaleSource = 'useleppa';
		},
		'num': 154,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Restores 5 PP to the first of the holder\'s moves to reach 0 PP. Single use.'
	},
	{
		'id': 'pinkbow',
		'name': 'Pink Bow',
		'spritenum': 444,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Normal') {
				return basePower * 1.1;
			}
		},
		'num': 251,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
	},
	{
		'id': 'polkadotbow',
		'name': 'Polkadot Bow',
		'spritenum': 444,
		'onBasePower' (basePower, user, target, move) {
			if (move.type === 'Normal') {
				return basePower * 1.1;
			}
		},
		'num': 251,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder\'s Normal-type attacks have 1.1x power.'
	},
	{
		'id': 'przcureberry',
		'name': 'PRZ Cure Berry',
		'spritenum': 63,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Fire'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'par') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'par') {
				pokemon.cureStatus();
			}
		},
		'num': 149,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder cures itself if it is paralyzed. Single use.'
	},
	{
		'id': 'psncureberry',
		'name': 'PSN Cure Berry',
		'spritenum': 333,
		'isBerry': true,
		'naturalGift': {
			'basePower': 80,
			'type': 'Electric'
		},
		'onUpdate' (pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.eatItem();
			}
		},
		'onEat' (pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				pokemon.cureStatus();
			}
		},
		'num': 151,
		'gen': 2,
		'isNonstandard': 'gen2',
		'desc': '(Gen 2) Holder is cured if it is poisoned. Single use.'
	},

	// CAP items

	{
		'id': 'crucibellite',
		'name': 'Crucibellite',
		'spritenum': 577,
		'megaStone': 'Crucibelle-Mega',
		'megaEvolves': 'Crucibelle',
		'onTakeItem' (item, source) {
			if (item.megaEvolves === source.baseTemplate.baseSpecies) {
				return false;
			}

			return true;
		},
		'num': -1,
		'gen': 6,
		'isNonstandard': true,
		'desc': 'If held by a Crucibelle, this item allows it to Mega Evolve in battle.'
	}
];

module.exports = {
	BattleItems
};