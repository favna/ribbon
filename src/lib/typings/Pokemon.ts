import { StringOrNumber } from './General';

interface FlavorTextType {
  version_id: string;
  flavor_text: string;
}

interface PokeAlias {
  alias: string;
}

interface PokeStatType {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;

  [propName: string]: StringOrNumber | undefined;
}

interface PokeAbilityType {
  0: string;
  1?: string;
  H?: string;
  S?: string;

  [propName: string]: string | undefined;
}

interface PokeTypesType {
  bug: number;
  dark: number;
  dragon: number;
  electric: number;
  fairy: number;
  fighting: number;
  fire: number;
  flying: number;
  ghost: number;
  grass: number;
  ground: number;
  ice: number;
  normal: number;
  poison: number;
  psychic: number;
  rock: number;
  steel: number;
  water: number;

  [propName: string]: number;
}

interface PokeGenderRatioType {
  M: number;
  F: number;
}

export interface PokeDataType {
  abilities?: string;
  evos?: string;
  flavors?: string;
  genders?: string;
  sprite: string;
  tier?: string;
}

export type FlavorDataType = PokeDataType & {
  entries: {
    game: string;
    text: string;
  }[];
};

export interface Pokedex {
  num: number;
  species: string;
  types: string[];
  genderRatio?: PokeGenderRatioType;
  gender?: string;
  baseStats: PokeStatType;
  abilities: PokeAbilityType;
  heightm: number;
  weightkg: number;
  color: string;
  name?: string;
  baseForme?: string;
  baseSpecies?: string;
  forme?: string;
  formeLetter?: string;
  prevo?: string;
  evos?: string[];
  evoLevel?: StringOrNumber;
  eggGroups?: string[];
  otherFormes?: string[];
}

export interface PokemonAbility {
  desc?: string;
  shortDesc: string;
  id: string;
  name: string;
  num: number;
}

export interface PokemonItem {
  id: string;
  name: string;
  desc: string;
  gen: number;
  num: number;
  shortDesc?: string;
}

export interface PokemonMove {
  id: string;
  num: number;
  name: string;
  shortDesc: string;
  type: string;
  basePower: StringOrNumber;
  pp: number;
  category: string;
  accuracy: boolean | StringOrNumber;
  priority: number;
  target: string;
  contestType: string;
  isZ?: string;
  desc?: string;
}

export type abilityAlias = PokeAlias & {
  ability: string;
};

export type tierAlias = PokeAlias & {
  tier: string;
};

export type PokedexAlias = PokeAlias & {
  name: string;
};

export type itemAlias = PokeAlias & {
  item: string;
};

export type moveAlias = PokeAlias & {
  move: string;
};

export interface TCGPropsType {
  name: string;
  types: string;
  subtype: string;
  supertype?: string;
  hp: string;
}

export interface PokeTypeDataType {
  doubleEffectiveTypes: string[];
  doubleResistedTypes: string[];
  effectiveTypes: string[];
  effectlessTypes: string[];
  multi: PokeTypesType;
  normalTypes: string[];
  resistedTypes: string[];
}

export interface FlavorJSONType {
  [propName: string]: FlavorTextType[];
}

export interface FormatsJSONType {
  [propName: string]: string;
}

interface DamageDealtTakenType { damageTaken: Required<PokeTypesType>; damageDealt: Required<PokeTypesType> }

export interface TypeChart {
  Bug: DamageDealtTakenType;
  Dark: DamageDealtTakenType;
  Dragon: DamageDealtTakenType;
  Electric: DamageDealtTakenType;
  Fairy: DamageDealtTakenType;
  Fighting: DamageDealtTakenType;
  Fire: DamageDealtTakenType;
  Flying: DamageDealtTakenType;
  Ghost: DamageDealtTakenType;
  Grass: DamageDealtTakenType;
  Ground: DamageDealtTakenType;
  Ice: DamageDealtTakenType;
  Normal: DamageDealtTakenType;
  Poison: DamageDealtTakenType;
  Psychic: DamageDealtTakenType;
  Rock: DamageDealtTakenType;
  Steel: DamageDealtTakenType;
  Water: DamageDealtTakenType;

  [propName: string]: DamageDealtTakenType;
}

type ShowdownTierUnion = 'ou' | 'uu' | 'uber' | 'nu' | 'ru' | 'pu' | 'lc' | 'monotype' | string;

interface ShowdownRanker {
  userid: string;
  username: string;
  w: number;
  l: number;
  t: number;
  gxe: number;
  r: number;
  rd: number;
  sigma: number;
  rptime: string;
  rpr: number;
  rprd: number;
  rpsigma: number;
  elo: number;
}

export interface ShowdownData {
  formatid: ShowdownTierUnion;
  format: ShowdownTierUnion;
  toplist: ShowdownRanker[];
}


export interface PokemonLearnsets {
  [propName: string]: {
    learnset: {
      [propName: string]: string[];
    };
  };
}

export type TCGType =
  'Grass' | 'Fire' | 'Water' | 'Lightning' |
  'Fighting' | 'Psychic' | 'Colorless' |
  'Darkness' | 'Metal' | 'Dragon' | 'Fairy';

export type TCGSuperType = 'Pokémon' | 'Trainer' | 'Energy';
export type TCGSubType =
  'EX' | 'Special' | 'Restored' | 'Level Up' |
  'MEGA' | 'Technical Machine' | 'Item' |
  'Stadium' | 'Supporter' | 'Stage 1' | 'GX' |
  'Pokémon Tool' | 'Basic' | 'LEGEND' | 'Stage 2' |
  'BREAK' | 'Rocket\'s Secret Machine';

interface TCGAttack {
  cost: TCGType[];
  name: string;
  text: string;
  damage: string;
  convertedEnergyCost: number;
}

interface TCGResistWeakness {
  type: TCGType;
  value: string;
}

interface TCGAbility {
  name: string;
  text: string;
  type: string;
}

interface TCGCard {
  name: string;
  id: string;
  nationalPokedexNumber?: number;
  types?: TCGType[];
  subtype: TCGSubType;
  supertype: TCGSuperType;
  hp?: string;
  number: string;
  artist: string;
  rarity: string;
  series: string;
  set: string;
  setCode: string;
  retreatCost?: TCGType[];
  convertedRetreatCost?: number;
  text: string;
  attacks?: TCGAttack[];
  weaknesses?: TCGResistWeakness[];
  resistances?: TCGResistWeakness[];
  ancientTrait?: string;
  ability?: TCGAbility;
  evolvesFrom?: string;
  contains?: string;
  imageUrl: string;
  imageUrlHiRes: string;
}

export interface TCGCardData {
  cards: TCGCard[];
}