import { Command } from 'awesome-commando';
import { Snowflake, TextChannel, VoiceChannel, VoiceConnection } from 'awesome-djs';
import { GoogleSource } from './Constants';
import { Song } from './Utils';

type FlavorTextType = {
    version_id: string;
    flavor_text: string;
};

type PokeAliasType = {
    alias: string;
};

type YoutubeVideoContentDetailsType = {
    videoId: string;
    videoPublishedAt: string;
};

export type YoutubeVideoSnippetType = {
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

type YoutubeVideoThumbnailType = {
    default: { height: number; width: null; url: string };
    high?: { height: number; width: null; url: string };
    medium?: { height: number; width: null; url: string };
    standard?: { height: number; width: null; url: string };
};

export type YoutubeVideoResourceType = {
    kind: string;
    videoId: string;
};

export type YoutubeResultList = {
    etag: string;
    items: {
        etag: string
        id: YoutubeVideoResourceType;
        kind: string;
        snippet: YoutubeVideoSnippetType;
    }[];
    kind: string;
    nextPageToken: string;
    pageInfo: {resultsPerPage: number, totalResults: number };
    regionCode: string;
};

type DiscordGameExecutableType = {
    name: string;
    os: string;
};

type FrontlineGirlConstantsType = {
    mov: number;
    crit_rate: number;
    crit_dmg: number;
    pen: number;

    [propName: string]: number;
};

type FrontlineGirlStatsType = {
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

type KitsuPosterImageDimensions = {
    width: number | null;
    height: number | null;
};

type KitsuPosterImage = {
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

type KitsuTitles = {
    en: string;
    en_jp: string;
    ja_jp: string;
};

type FrontlineGirlAbilityType = {
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

type PokeStatType = {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;

    [propName: string]: string | number | undefined;
};

type PokeAbilityType = {
    0: string;
    1?: string;
    H?: string;
    S?: string;

    [propName: string]: string | undefined;
};

type PokeTypesType = {
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

type PokeGenderRatioType = {
    M: number;
    F: number;
};

export type CydiaAPIPackageType = {
    display: string;
    name: string;
    summary: string;
    version: string;
    thumbnail: string;
};

export type CydiaData = {
    source: string;
    size: string;
    baseURL: string;
    section: string;
    price: 'Free' | string;
} & CydiaAPIPackageType;

export type SimpleEmbedFieldType = { name: string, value: string };
export type DiscordGameDevType = { id: string, name: string };

export interface IMusicCommand extends Command {
    queue: any;
    votes: any;
}

export type MusicQueueType = {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection | null;
    songs: Song[];
    volume: number;
    playing: boolean;
    isTriggeredByStop?: boolean;
};

export type MusicVoteType = {
    count: number;
    users: Snowflake[];
    queue: MusicQueueType;
    guild: Snowflake;
    start: number;
    timeout: any;
};

export type YoutubeVideoType = {
    id: string;
    title: string;
    kind: string;
    etag?: string;
    durationSeconds: number;
    contentDetails?: YoutubeVideoContentDetailsType;
    snippet?: YoutubeVideoSnippetType;
};

export type PokeDataType = {
    abilities?: string;
    evos?: string;
    flavors?: string;
    genders?: string;
    sprite: string;
    tier?: string;
    entries: any[];
};

export type CasinoRowType = {
    userID: string;
    balance: number;
    lastdaily: string;
    lastweekly: string;
    vault: number;
};

export type PokedexType = {
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

export type PokeAbilityDetailsType = {
    desc?: string;
    shortDesc: string;
    id: string;
    name: string;
    num: number;
};

export type PokeItemDetailsType = {
    id: string;
    name: string;
    desc: string;
    gen: number;
    num: number;
    shortDesc?: string;
};

export type PokeMoveDetailsType = {
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

export interface IPokeAbilityAliases extends PokeAliasType {
    ability: string;
}

export interface IPokeTierAliases extends PokeAliasType {
    tier: string;
}

export interface IPokeDexAliases extends PokeAliasType {
    name: string;
}

export interface IPokeItemAliases extends PokeAliasType {
    item: string;
}

export interface IPokeMoveAliases extends PokeAliasType {
    move: string;
}

export type TCGPropsType = {
    name: string;
    types: string;
    subtype: string;
    supertype?: string;
    hp: string;
};

export type PokeTypeDataType = {
    doubleEffectiveTypes: string[];
    doubleResistedTypes: string[];
    effectiveTypes: string[];
    effectlessTypes: string[];
    multi: PokeTypesType;
    normalTypes: string[];
    resistedTypes: string[];
};

export type WordDefinitionType = {
    language: string;
    text: string;
};

export type SteamGenreType = {
    description: string;
    id: string;
};

export type OverwatchHeroType = {
    hero: string;
    time: number;
};

export type CopypastaType = {
    id: number;
    name: string;
    content: string;
};

export type TimerType = {
    id: number;
    interval: number;
    channel: Snowflake;
    content: string;
    lastsend: string;
    members: string;
};

export type FortniteStatsType = {
    key: string;
    value: string;
};

export type CountdownType = {
    id: number;
    channel: string;
    content: string;
    datetime: string;
    lastsend: string;
    tag: string;
};

export type FlavorJSONType = {
    [propName: string]: FlavorTextType[];
};

export type FormatsJSONType = {
    [propName: string]: string;
};

export type DiscordGameSKUType = {
    distributor: string;
    sku: string;
};

export type DiscordGameType = {
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

export type DiscordGameParsedType = {
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

export type DiscordStoreGameType = {
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

export type FrontlineGirlProductionRequirementsType = {
    manpower: number;
    ammo: number;
    rations: number;
    parts: number;

    [propName: string]: number;
};

export type FrontlineGirlType = {
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

export type KitsuHit = {
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

export type KitsuResult = {
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

export type eShopHit = {
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

type eShoData = {
    hits: eShopHit[];
    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
    processingTimeMS: number;
};

export type eShopResult = {
    results: eShoData[];
};

type GoogleCSEImage = {
    src: string;
    height?: string;
    width?: string;
};

export type GoogleItemCommon = {
    source: GoogleSource;
};

export type GoogleKnowledgeItem = {
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
    }
} & GoogleItemCommon;

export type GoogleItem = GoogleKnowledgeItem['result'] | GoogleCSEItem | GoogleItemCommon;

type GoogleImage = {
    byteSize: number;
    contextLink: string;
    height: number;
    thumbnailHeight: number;
    thumbnailLink: string;
    thumbnailWidth: number;
    width: number;
};

export type GoogleImageData = {
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

export type GoogleImageResult = {
    kind: string;
    context: { title: string };
    items: GoogleImageData[];
};

export type IgdbGame = {
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

export type iTunesData = {
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

export type iTunesResult = {
    results: iTunesData[];
    resultCount: number;
};

export type MovieGenreType = {
    name: string;
};

type TMDBCommon = {
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

export type TMDBMovieList = {
    page: number;
    total_pages: number;
    total_results: number;
    results: (TMDBCommon & { genre_ids: number[] })[]
};

export interface TMDBMovie extends TMDBCommon {
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
}

export interface TVDBSeriesList extends TMDBMovieList {
    results: (TMDBCommon &
    {
        genre_ids: number[];
        first_air_date: string;
        origin_country: string[];
    })[];
}

type TMDBSerieEpisode = {
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

export interface TMDBSerie extends TMDBCommon {
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
}

export type UrbanDefinition = {
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

export interface UrbanDefinitionResults {
    list: UrbanDefinition[];
}