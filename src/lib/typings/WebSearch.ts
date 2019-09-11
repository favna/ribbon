import { GoogleSource } from '@utils/Constants';

interface DiscordGameExecutableType {
  name: string;
  os: string;
}

interface KitsuPosterImageDimensions {
  width: number | null;
  height: number | null;
}

interface KitsuPosterImage {
  tiny?: string;
  small?: string;
  medium?: string;
  large?: string;
  original: string;
  meta: {
    dimensions: {
      large: KitsuPosterImageDimensions;
      medium: KitsuPosterImageDimensions;
      small: KitsuPosterImageDimensions;
      tiny: KitsuPosterImageDimensions;
    };
  };
}

interface KitsuTitles {
  en: string;
  en_jp: string;
  ja_jp: string;
}

export interface CydiaAPIPackageType {
  display: string;
  name: string;
  summary: string;
  version: string;
  thumbnail: string;
}

export type CydiaData = {
  source: string;
  size: string;
  baseURL: string;
  section: string;
  price: 'Free' | string;
} & CydiaAPIPackageType;

export interface DiscordGameDevType { id: string; name: string }

export interface WordDefinitionType {
  language: string;
  text: string;
}

export interface DiscordGameSKUType {
  distributor: string;
  sku: string;
}

export interface DiscordGameType {
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
}

export interface DiscordGameParsedType {
  id: string;
  icon: string;
  name?: string;
  store_link?: string;
  developers?: DiscordGameDevType[];
  publishers?: DiscordGameDevType[];
  summary?: string;
  price?: string;
  thumbnail?: string;
}

export interface DiscordStoreGameType {
  code?: string;
  id?: string;
  summary?: string;
  sku?: {
    name: string;
    price: {
      currency: string;
      amount: number;
    };
  };
  thumbnail?: {
    id: string;
  };
}

export interface KitsuHit {
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
}

export interface KitsuResult {
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
}

export interface EShopHit {
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
}

interface EShopData {
  hits: EShopHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
}

export interface EShopResult {
  results: EShopData[];
}

interface GoogleCSEImage {
  src: string;
  height?: string;
  width?: string;
}

export interface GoogleItemCommon {
  source: GoogleSource;
}

export interface GoogleKnowledgeItem {
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
    };
    image: {
      contentUrl: string;
    };
  } & GoogleItemCommon;
}

export type GoogleCSEItem = {
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
  };
} & GoogleItemCommon;

export type GoogleItem = GoogleKnowledgeItem['result'] | GoogleCSEItem;

interface GoogleImage {
  byteSize: number;
  contextLink: string;
  height: number;
  thumbnailHeight: number;
  thumbnailLink: string;
  thumbnailWidth: number;
  width: number;
}

export interface GoogleImageData {
  displayLink: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  mime: string;
  snippet: string;
  title: string;
  image: GoogleImage;
}

export interface GoogleImageResult {
  kind: string;
  context: { title: string };
  items: GoogleImageData[];
}

export interface IgdbGame {
  id: number;
  name: string;
  rating: number;
  summary: string;
  url: string;
  age_ratings: { id: number; category: number; rating: number }[];
  cover: { id: number; url: string };
  genres: { id: number; name: string }[];
  involved_companies: {
    id: number; developer: boolean; company: {
      id: number;
      name: string;
    };
  }[];
  platforms: { id: number; name: string }[];
  release_dates: { id: string; date: number }[];
}

export interface AppleItunesData {
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
}

export interface AppleItunesResult {
  results: AppleItunesData[];
  resultCount: number;
}

export interface MovieGenreType {
  name: string;
}

interface TMDBCommon {
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
}

export interface TMDBMovieList {
  page: number;
  total_pages: number;
  total_results: number;
  results: (TMDBCommon & { genre_ids: number[] })[];
}

export type TMDBMovie = {
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  homepage?: string;
  runtime?: number;
  imdb_id?: number;
  genres: { id: number; name: string }[];
  spoken_language: { iso_639_1: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  belongs_to_collection?: { id: number; name: string; poster_path: string };
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
} & TMDBCommon;

export type TVDBSeriesList = {
  results: (TMDBCommon &
  {
    genre_ids: number[];
    first_air_date: string;
    origin_country: string[];
  })[];
} & TMDBMovieList;

interface TMDBSerieEpisode {
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
}

export type TMDBSerie = {
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
    name: string; overview: string; poster_path: string; season_number: number;
  }[];
  genres: { id: number; name: string }[];
  networks: { id: number; logo_path: string; name: string; origin_country: string }[];
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
} & TMDBCommon;

export interface UrbanDefinition {
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
}

export interface UrbanDefinitionResults {
  list: UrbanDefinition[];
}

export interface NekoData {
  url: string;
}