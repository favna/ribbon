import { GoogleSource } from '@components/Constants';
import { Song } from '@components/Utils';
import { Command } from 'awesome-commando';
import { Snowflake, TextChannel, VoiceChannel, VoiceConnection } from 'awesome-djs';

declare type FlavorTextType = {
  version_id: string;
  flavor_text: string;
};

declare type PokeAliasType = {
  alias: string;
};

declare type YoutubeVideoContentDetailsType = {
  videoId: string;
  videoPublishedAt: string;
};

export declare type YoutubeVideoSnippetType = {
  channelId: string;
  channelTitle: string;
  description: string;
  playlistId?: string;
  position?: number;
  publishedAt: string;
  resourceId: YoutubeVideoResourceType;
  thumbnails: YoutubeVideoThumbnailType;
  title: string;
  liveBroadcastContent: string;
};

declare type YoutubeVideoThumbnailType = {
  default: { height: number; width: null; url: string };
  high?: { height: number; width: null; url: string };
  medium?: { height: number; width: null; url: string };
  standard?: { height: number; width: null; url: string };
};

export declare type YoutubeVideoResourceType = {
  kind: string;
  videoId: string;
};

export declare type YoutubeResultList = {
  etag: string;
  items: {
    etag: string
    id: YoutubeVideoResourceType;
    kind: string;
    snippet: YoutubeVideoSnippetType;
  }[];
  kind: string;
  nextPageToken: string;
  pageInfo: { resultsPerPage: number, totalResults: number };
  regionCode: string;
};

declare type DiscordGameExecutableType = {
  name: string;
  os: string;
};

declare type FrontlineGirlConstantsType = {
  mov: number;
  crit_rate: number;
  crit_dmg: number;
  pen: number;

  [propName: string]: number;
};

declare type FrontlineGirlStatsType = {
  hp: number;
  ammo: number;
  ration: number;
  dmg: number;
  eva: number;
  acc: number;
  rof: number;
  armor: number;

  [propName: string]: number;
};

declare type KitsuPosterImageDimensions = {
  width: number | null;
  height: number | null;
};

declare type KitsuPosterImage = {
  tiny?: string,
  small?: string,
  medium?: string,
  large?: string,
  original: string,
  meta: {
    dimensions: {
      large: KitsuPosterImageDimensions;
      medium: KitsuPosterImageDimensions;
      small: KitsuPosterImageDimensions;
      tiny: KitsuPosterImageDimensions;
    }
  }
};

declare type KitsuTitles = {
  en: string;
  en_jp: string;
  ja_jp: string;
};

declare type FrontlineGirlAbilityType = {
  name: string;
  icon: string;
  text: string;
  initial?: string;
  cooldown?: string[];
  damage_value?: string[];
  hit_value?: string[];
  round_quantity?: string[];
  time_value?: string[];

  [propName: string]: string | string[] | undefined;
};

declare type PokeStatType = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;

  [propName: string]: string | number | undefined;
};

declare type PokeAbilityType = {
  0: string;
  1?: string;
  H?: string;
  S?: string;

  [propName: string]: string | undefined;
};

declare type PokeTypesType = {
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
};

declare type PokeGenderRatioType = {
  M: number;
  F: number;
};

export declare type CydiaAPIPackageType = {
  display: string;
  name: string;
  summary: string;
  version: string;
  thumbnail: string;
};

export declare type CydiaData = {
  source: string;
  size: string;
  baseURL: string;
  section: string;
  price: 'Free' | string;
} & CydiaAPIPackageType;

export declare type SimpleEmbedFieldType = { name: string, value: string };
export declare type DiscordGameDevType = { id: string, name: string };

export declare type MusicCommand = {
  queue: any;
  votes: any;
} & Command;

export declare type MusicQueueType = {
  textChannel: TextChannel;
  voiceChannel: VoiceChannel;
  connection: VoiceConnection | null;
  songs: Song[];
  volume: number;
  playing: boolean;
  isTriggeredByStop?: boolean;
};

export declare type MusicVoteType = {
  count: number;
  users: Snowflake[];
  queue: MusicQueueType;
  guild: Snowflake;
  start: number;
  timeout: any;
};

export declare type YoutubeVideoType = {
  id: string;
  title: string;
  kind: string;
  etag?: string;
  durationSeconds: number;
  contentDetails?: YoutubeVideoContentDetailsType;
  snippet?: YoutubeVideoSnippetType;
};

export declare type PokeDataType = {
  abilities?: string;
  evos?: string;
  flavors?: string;
  genders?: string;
  sprite: string;
  tier?: string;
  entries: any[];
};

export declare type CasinoRowType = {
  userID: string;
  balance: number;
  lastdaily: string;
  lastweekly: string;
  vault: number;
};

export declare type PokedexType = {
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
  evoLevel?: number | string;
  eggGroups?: string[];
  otherFormes?: string[];
};

export declare type PokeAbilityDetailsType = {
  desc?: string;
  shortDesc: string;
  id: string;
  name: string;
  num: number;
};

export declare type PokeItemDetailsType = {
  id: string;
  name: string;
  desc: string;
  gen: number;
  num: number;
  shortDesc?: string;
};

export declare type PokeMoveDetailsType = {
  id: string;
  num: number;
  name: string;
  shortDesc: string;
  type: string;
  basePower: string | number;
  pp: number;
  category: string;
  accuracy: boolean | string | number;
  priority: number;
  target: string;
  contestType: string;
  isZ?: string;
  desc?: string;
};

export declare type PokeAbilityAliases = PokeAliasType & {
  ability: string;
};

export declare type PokeTierAliases = PokeAliasType & {
  tier: string;
};

export declare type PokeDexAliases = PokeAliasType & {
  name: string;
};

export declare type PokeItemAliases = PokeAliasType & {
  item: string;
};

export declare type PokeMoveAliases = PokeAliasType & {
  move: string;
};

export declare type TCGPropsType = {
  name: string;
  types: string;
  subtype: string;
  supertype?: string;
  hp: string;
};

export declare type PokeTypeDataType = {
  doubleEffectiveTypes: string[];
  doubleResistedTypes: string[];
  effectiveTypes: string[];
  effectlessTypes: string[];
  multi: PokeTypesType;
  normalTypes: string[];
  resistedTypes: string[];
};

export declare type WordDefinitionType = {
  language: string;
  text: string;
};

export declare type SteamGenreType = {
  description: string;
  id: string;
};

export declare type OverwatchHeroType = {
  hero: string;
  time: number;
};

export declare type CopypastaType = {
  id: number;
  name: string;
  content: string;
};

export declare type TimerType = {
  id: number;
  interval: number;
  channel: Snowflake;
  content: string;
  lastsend: string;
  members: string;
};

export declare type FortniteStatsType = {
  key: string;
  value: string;
};

export declare type CountdownType = {
  id: number;
  channel: string;
  content: string;
  datetime: string;
  lastsend: string;
  tag: string;
};

export declare type FlavorJSONType = {
  [propName: string]: FlavorTextType[];
};

export declare type FormatsJSONType = {
  [propName: string]: string;
};

export declare type DiscordGameSKUType = {
  distributor: string;
  sku: string;
};

export declare type DiscordGameType = {
  description: string;
  developers: string[];
  distributor_applications: DiscordGameSKUType[];
  executables: DiscordGameExecutableType[];
  icon: string;
  id: string;
  name: string;
  publishers: string[];
  splash: string;
  summary: string;
  third_party_skus: DiscordGameSKUType[];
};

export declare type DiscordGameParsedType = {
  id: string;
  icon: string;
  name?: string;
  store_link?: string;
  developers?: DiscordGameDevType[];
  publishers?: DiscordGameDevType[];
  summary?: string;
  price?: string;
  thumbnail?: string;
};

export declare type DiscordStoreGameType = {
  code?: string;
  id?: string;
  summary?: string;
  sku?: {
    name: string;
    price: {
      currency: string;
      amount: number;
    }
  };
  thumbnail?: {
    id: string;
  };
};

export declare type FrontlineGirlProductionRequirementsType = {
  manpower: number;
  ammo: number;
  rations: number;
  parts: number;

  [propName: string]: number;
};

export declare type FrontlineGirlType = {
  url: string;
  num: number;
  name: string;
  type: string;
  rating: number;
  constStats: FrontlineGirlConstantsType;
  baseStats: FrontlineGirlStatsType;
  maxStats: FrontlineGirlStatsType;
  ability: FrontlineGirlAbilityType;
  ability2?: FrontlineGirlAbilityType;
  tile_bonus: string;
  bonus_desc: string;
  production: {
    timer?: string;
    normal?: FrontlineGirlProductionRequirementsType;
    heavy?: FrontlineGirlProductionRequirementsType;
    reward?: string;
    stage?: string;
  };
  img?: string;
};

export declare type KitsuHit = {
  abbreviatedTitles: string[];
  ageRating: 'PG' | 'G' | string;
  averageRating: number;
  canonicalTitle: string;
  endDate: number;
  episodeCount: number;
  episodeLength: number;
  favoritesCount: number;
  id: number;
  kind: 'anime' | string;
  objectID: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | string;
  seasonYear: number;
  slug: string;
  startDate: number;
  subtype: 'TV' | 'movie' | 'special' | string;
  synopsis: string;
  totalLength: number;
  userCount: number;
  year: number;
  posterImage: KitsuPosterImage;
  titles: KitsuTitles;
  _tags: string[];
};

export declare type KitsuResult = {
  exhaustiveNbHits: boolean;
  hitsPerPage: number;
  nbHits: number;
  nbPages: number;
  page: number;
  params: string;
  processingTimeMS: number;
  query: string;
  queryAfterRemoval: string;
  hits: KitsuHit[];
};

export declare type eShopHit = {
  type: string;
  locale: string;
  url: string;
  title: string;
  description: string;
  lastModified: number;
  id: string;
  nsuid: string;
  slug: string;
  boxArt: string;
  gallery: string;
  platform: string;
  releaseDateMask: string;
  characters: string[];
  categories: string[];
  msrp: number;
  esrb: string;
  esrbDescriptors: string;
  virtualConsole: string;
  generalFilters: string[];
  filterShops: string[];
  filterPlayers: string[];
  players: string;
  features: boolean;
  freeToStart: boolean;
  priceRange: string;
  salePrice: number | null;
  availability: string[];
  objectID: string;
};

declare type eShoData = {
  hits: eShopHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
};

export declare type eShopResult = {
  results: eShoData[];
};

declare type GoogleCSEImage = {
  src: string;
  height?: string;
  width?: string;
};

export declare type GoogleItemCommon = {
  source: GoogleSource;
};

export declare type GoogleKnowledgeItem = {
  '@type': string;
  resultScore: number;
  result: {
    '@id': string;
    '@type': string[];
    description: string;
    name: string;
    url: string;
    detailedDescription: {
      articleBody: string;
      license: string;
      url: string;
    }
    image: {
      contentUrl: string;
    }
  } & GoogleItemCommon
};

export declare type GoogleCSEItem = {
  cacheId: string;
  displayLink: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  snippet: string;
  title: string;
  pagemap: {
    cse_image: GoogleCSEImage[];
    cse_thumbnail: GoogleCSEImage[];
  }
} & GoogleItemCommon;

export declare type GoogleItem = GoogleKnowledgeItem['result'] | GoogleCSEItem | GoogleItemCommon;

declare type GoogleImage = {
  byteSize: number;
  contextLink: string;
  height: number;
  thumbnailHeight: number;
  thumbnailLink: string;
  thumbnailWidth: number;
  width: number;
};

export declare type GoogleImageData = {
  displayLink: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  mime: string;
  snippet: string;
  title: string;
  image: GoogleImage;
};

export declare type GoogleImageResult = {
  kind: string;
  context: { title: string };
  items: GoogleImageData[];
};

export declare type IgdbGame = {
  id: number;
  name: string;
  rating: number;
  summary: string;
  url: string;
  age_ratings: { id: number; category: number; rating: number; }[];
  cover: { id: number; url: string };
  genres: { id: number; name: string }[];
  involved_companies: {
    id: number; developer: boolean; company: {
      id: number;
      name: string;
    }
  }[];
  platforms: { id: number; name: string; }[];
  release_dates: { id: string; date: number }[];
};

export declare type iTunesData = {
  artistId: number;
  artistName: string;
  artistViewUrl: string;
  artworkUrl100: string;
  artworkUrl30: string;
  artworkUrl60: string;
  collectionCensoredName: string;
  collectionExplicitness: 'explicit' | string;
  collectionId: number;
  collectionName: string;
  collectionPrice: number;
  collectionViewUrl: string;
  country: string;
  currency: string;
  discCount: number;
  discNumber: number;
  isStreamable: boolean;
  kind: 'song' | string;
  previewUrl: string;
  primaryGenreName: string;
  releaseDate: string;
  trackCensoredName: string;
  trackCount: number;
  trackExplicitness: 'notExplicit' | string;
  trackId: number;
  trackName: string;
  trackNumber: number;
  trackPrice: number;
  trackTimeMillis: number;
  trackViewUrl: string;
  wrapperType: 'track' | string;
};

export declare type iTunesResult = {
  results: iTunesData[];
  resultCount: number;
};

export declare type MovieGenreType = {
  name: string;
};

declare type TMDBCommon = {
  id: number;
  adult: boolean;
  backdrop_path: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average?: number;
  vote_count?: number;
};

export declare type TMDBMovieList = {
  page: number;
  total_pages: number;
  total_results: number;
  results: (TMDBCommon & { genre_ids: number[] })[]
};

export declare type TMDBMovie = {
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  homepage?: string;
  runtime?: number;
  imdb_id?: number;
  genres: { id: number; name: string }[];
  spoken_language: { iso_639_1: number; name: string; }[];
  production_countries?: { iso_3166_1: string; name: string; }[];
  belongs_to_collection?: { id: number; name: string; poster_path: string; };
  production_companies?: { id: number, logo_path: string | null; name: string; origin_country: string; }[];
} & TMDBCommon;

export declare type TVDBSeriesList = {
  results: (TMDBCommon &
    {
      genre_ids: number[];
      first_air_date: string;
      origin_country: string[];
    })[];
} & TMDBMovieList;

declare type TMDBSerieEpisode = {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
};

export declare type TMDBSerie = {
  created_by: string[];
  episode_run_time: number[];
  first_air_date: string;
  in_production: boolean;
  languages: string[];
  status: string;
  type: string;
  name: string;
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  last_air_date: string;
  last_episode_to_air: TMDBSerieEpisode;
  next_episode_to_air: TMDBSerieEpisode | null;
  homepage?: string;
  seasons: {
    id: number; air_date: string; episode_count: number;
    name: string; overview: string; poster_path: string; season_number: number
  }[];
  genres: { id: number; name: string }[];
  networks: { id: number; logo_path: string; name: string; origin_country: string; }[];
  production_companies?: { id: number, logo_path: string | null; name: string; origin_country: string; }[];
} & TMDBCommon;

export declare type UrbanDefinition = {
  author: string;
  current_vote: string;
  defid: number;
  definition: string;
  example: string;
  permalink: string;
  sound_urls: string[];
  thumbs_down: number;
  thumbs_up: number;
  word: string;
  written_on: string;
};

export declare type UrbanDefinitionResults = {
  list: UrbanDefinition[];
};

export declare type SayData = {
  argString: string;
  authorID: string;
  authorTag: string;
  avatarURL: string;
  commandPrefix: string;
  memberHexColor: string;
  messageDate: Date;
  attachment: string;
};

declare type DamageDealtTakenType = { damageTaken: Required<PokeTypesType>, damageDealt: Required<PokeTypesType> };

export declare type TypeChartType = {
  Bug: DamageDealtTakenType,
  Dark: DamageDealtTakenType,
  Dragon: DamageDealtTakenType,
  Electric: DamageDealtTakenType,
  Fairy: DamageDealtTakenType,
  Fighting: DamageDealtTakenType,
  Fire: DamageDealtTakenType,
  Flying: DamageDealtTakenType,
  Ghost: DamageDealtTakenType,
  Grass: DamageDealtTakenType,
  Ground: DamageDealtTakenType,
  Ice: DamageDealtTakenType,
  Normal: DamageDealtTakenType,
  Poison: DamageDealtTakenType,
  Psychic: DamageDealtTakenType,
  Rock: DamageDealtTakenType,
  Steel: DamageDealtTakenType,
  Water: DamageDealtTakenType

  [propName: string]: DamageDealtTakenType;
};