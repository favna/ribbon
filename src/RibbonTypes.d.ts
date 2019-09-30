declare module 'RibbonTypes' {
  import { GoogleSource } from '@components/Constants';
  import { Song } from '@components/Utils';
  import { Command } from 'discord.js-commando';
  import { Snowflake, TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';

  export type StringOrNumber = string | number;

  interface FlavorTextType {
    version_id: string;
    flavor_text: string;
  }

  interface PokeAlias {
    alias: string;
  }

  interface YoutubeVideoContentDetailsType {
    videoId: string;
    videoPublishedAt: string;
  }

  export interface YoutubeVideoSnippetType {
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
  }

  interface YoutubeVideoThumbnailType {
    default: { height: number; width: null; url: string };
    high?: { height: number; width: null; url: string };
    medium?: { height: number; width: null; url: string };
    standard?: { height: number; width: null; url: string };
  }

  export interface YoutubeVideoResourceType {
    kind: string;
    videoId: string;
  }

  export interface YoutubeResultList {
    etag: string;
    items: {
      contentDetails: YoutubeVideoContentDetailsType;
      etag: string;
      id: YoutubeVideoResourceType;
      kind: string;
      snippet: YoutubeVideoSnippetType;
    }[];
    kind: string;
    nextPageToken: string;
    pageInfo: { resultsPerPage: number; totalResults: number };
  }

  interface DiscordGameExecutableType {
    name: string;
    os: string;
  }

  interface FrontlineGirlConstantsType {
    mov: number;
    crit_rate: number;
    crit_dmg: number;
    pen: number;

    [propName: string]: number;
  }

  interface FrontlineGirlStatsType {
    hp: number;
    ammo: number;
    ration: number;
    dmg: number;
    eva: number;
    acc: number;
    rof: number;
    armor: number;

    [propName: string]: number;
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

  interface FrontlineGirlAbilityType {
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

  export interface SimpleEmbedFieldType { name: string; value: string }
  export interface DiscordGameDevType { id: string; name: string }

  export type MusicCommand = {
    queue: Map<string, MusicQueueType>;
    votes: Map<Snowflake, MusicVoteType>;
  } & Command;

  export interface MusicQueueType {
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection | null;
    songs: Song[];
    volume: number;
    playing: boolean;
    isTriggeredByStop?: boolean;
  }

  export interface MusicVoteType {
    count: number;
    users: Snowflake[];
    queue: MusicQueueType;
    guild: Snowflake;
    start: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timeout: any;
  }

  export interface YoutubeVideoType {
    id: string;
    title: string;
    kind: string;
    etag?: string;
    durationSeconds: number;
    contentDetails?: YoutubeVideoContentDetailsType;
    snippet?: YoutubeVideoSnippetType;
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

  export interface WordDefinitionType {
    language: string;
    text: string;
  }

  export interface SteamGenreType {
    description: string;
    id: string;
  }

  export interface FortniteStatsType {
    key: string;
    value: string;
  }

  export interface FlavorJSONType {
    [propName: string]: FlavorTextType[];
  }

  export interface FormatsJSONType {
    [propName: string]: string;
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

  export interface FrontlineGirlProductionRequirementsType {
    manpower: number;
    ammo: number;
    rations: number;
    parts: number;

    [propName: string]: number;
  }

  export interface FrontlineGirl {
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

  export interface SayData {
    argString: string;
    authorID: string;
    authorTag: string;
    avatarURL: string;
    commandPrefix: string;
    memberHexColor: string;
    messageDate: Date;
    attachment: string;
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

  export interface CurrencyUnits {
    AED: number; AFN: number; ALL: number; AMD: number; ANG: number; AOA: number; ARS: number;
    AUD: number; AWG: number; AZN: number; BAM: number; BBD: number; BDT: number; BGN: number;
    BHD: number; BIF: number; BMD: number; BND: number; BOB: number; BRL: number; BSD: number;
    BTC: number; BTN: number; BWP: number; BYN: number; BZD: number; CAD: number; CDF: number;
    CHF: number; CLF: number; CLP: number; CNH: number; CNY: number; COP: number; CRC: number;
    CUC: number; CUP: number; CVE: number; CZK: number; DJF: number; DKK: number; DOP: number;
    DZD: number; EGP: number; ERN: number; ETB: number; EUR: number; FJD: number; FKP: number;
    GBP: number; GEL: number; GGP: number; GHS: number; GIP: number; GMD: number; GNF: number;
    GTQ: number; GYD: number; HKD: number; HNL: number; HRK: number; HTG: number; HUF: number;
    IDR: number; ILS: number; IMP: number; INR: number; IQD: number; IRR: number; ISK: number;
    JEP: number; JMD: number; JOD: number; JPY: number; KES: number; KGS: number; KHR: number;
    KMF: number; KPW: number; KRW: number; KWD: number; KYD: number; KZT: number; LAK: number;
    LBP: number; LKR: number; LRD: number; LSL: number; LYD: number; MAD: number; MDL: number;
    MGA: number; MKD: number; MMK: number; MNT: number; MOP: number; MRO: number; MRU: number;
    MUR: number; MVR: number; MWK: number; MXN: number; MYR: number; MZN: number; NAD: number;
    NGN: number; NIO: number; NOK: number; NPR: number; NZD: number; OMR: number; PAB: number;
    PEN: number; PGK: number; PHP: number; PKR: number; PLN: number; PYG: number; QAR: number;
    RON: number; RSD: number; RUB: number; RWF: number; SAR: number; SBD: number; SCR: number;
    SDG: number; SEK: number; SGD: number; SHP: number; SLL: number; SOS: number; SRD: number;
    SSP: number; STD: number; STN: number; SVC: number; SYP: number; SZL: number; THB: number;
    TJS: number; TMT: number; TND: number; TOP: number; TRY: number; TTD: number; TWD: number;
    TZS: number; UAH: number; UGX: number; USD: number; UYU: number; UZS: number; VEF: number;
    VES: number; VND: number; VUV: number; WST: number; XAF: number; XAG: number; XAU: number;
    XCD: number; XDR: number; XOF: number; XPD: number; XPF: number; XPT: number; YER: number;
    ZAR: number; ZMW: number; ZWL: number;

    [propName: string]: number;
  }

  export interface RedditAbout {
    comment_karma: number;
    created: number;
    created_utc: number;
    has_subscribed: boolean;
    has_verified_email: boolean;
    hide_from_robots: boolean;
    icon_img: string;
    id: string;
    is_employee: boolean;
    is_friend: boolean;
    is_gold: boolean;
    is_mod: boolean;
    link_karma: number;
    name: string;
    pref_show_snoovatar: boolean;
    subreddit: unknown;
    verified: boolean;
  }

  export interface RedditComment {
    all_awardings: unknown[];
    total_awards_received: number;
    approved_at_utc: unknown;
    edited: boolean;
    mod_reason_by: unknown;
    banned_by: unknown;
    author_flair_type: string;
    removal_reason: unknown;
    link_id: string;
    author_flair_template_id: unknown;
    likes: unknown;
    replies: string;
    user_reports: unknown[];
    saved: boolean;
    id: string;
    banned_at_utc: unknown;
    mod_reason_title: unknown;
    gilded: number;
    archived: boolean;
    no_follow: boolean;
    author: string;
    num_comments: number;
    can_mod_post: boolean;
    created_utc: number;
    send_replies: boolean;
    parent_id: string;
    score: 1;
    author_fullname: string;
    over_18: boolean;
    approved_by: unknown;
    mod_note: unknown;
    subreddit_id: string;
    body: string;
    link_title: string;
    author_flair_css_class: string;
    name: string;
    author_patreon_flair: boolean;
    downs: number;
    author_flair_richtext: {
      e: string;
      t: string;
    }[];
    is_submitter: boolean;
    body_html: string;
    gildings: unknown;
    collapsed_reason: unknown;
    distinguished: unknown;
    stickied: boolean;
    can_gild: boolean;
    subreddit: string;
    author_flair_text_color: string;
    score_hidden: boolean;
    permalink: string;
    num_reports: unknown;
    link_permalink: string;
    report_reasons: unknown;
    link_author: string;
    author_flair_text: string;
    link_url: string;
    created: number;
    collapsed: boolean;
    subreddit_name_prefixed: string;
    controversiality: number;
    locked: boolean;
    author_flair_background_color: string;
    mod_reports: unknown[];
    quarantine: boolean;
    subreddit_type: string;
    ups: number;
  }


  export interface RedditPost {
    all_awardings: unknown[];
    allow_live_comments: boolean;
    approved_at_utc: number | null;
    approved_by: string | null;
    archived: boolean;
    author: string;
    author_flair_background_color: unknown | null;
    author_flair_css_class: string | null;
    author_flair_richtext: unknown[];
    author_flair_template_id?: unknown;
    author_flair_text_color?: unknown;
    author_flair_text?: unknown;
    author_flair_type: string;
    author_fullname: string;
    author_patreon_flair: boolean;
    banned_at_utc?: unknown;
    banned_by?: unknown;
    can_gild: boolean;
    can_mod_post: boolean;
    category?: unknown;
    clicked: boolean;
    content_categories?: unknown;
    contest_mode: boolean;
    created_utc: number;
    created: number;
    discussion_type?: unknown;
    distinguished?: unknown;
    domain: string;
    downs: number;
    edited: boolean;
    gilded: number;
    gildings: unknown;
    hidden: boolean;
    hide_score: boolean;
    id: string;
    is_crosspostable: boolean;
    is_meta: boolean;
    is_original_content: boolean;
    is_reddit_media_domain: boolean;
    is_robot_indexable: boolean;
    is_self: boolean;
    is_video: boolean;
    likes?: unknown;
    link_flair_background_color: string;
    link_flair_css_class?: unknown;
    link_flair_richtext: unknown[];
    link_flair_text_color: string;
    link_flair_text?: unknown;
    link_flair_type: string;
    locked: boolean;
    media_embed: unknown;
    media_only: boolean;
    media?: unknown;
    mod_note?: unknown;
    mod_reason_by?: unknown;
    mod_reason_title?: unknown;
    mod_reports: unknown[];
    name: string;
    no_follow: boolean;
    num_comments: number;
    num_crossposts: number;
    num_reports?: unknown;
    over_18: boolean;
    parent_whitelist_status?: unknown;
    permalink: string;
    pinned: boolean;
    post_hint: string;
    preview: {
      images: {
        source: {
          url: string;
          width: number;
          height: number;
        };
        resolutions: {
          url: string;
          width: number;
          height: number;
        }[];
        variants: unknown;
        id: string;
      }[];
      enabled: boolean;
    };
    pwls?: unknown;
    quarantine: boolean;
    removal_reason?: unknown;
    report_reasons?: unknown;
    saved: boolean;
    score: number;
    secure_media_embed: unknown;
    secure_media?: unknown;
    selftext_html?: unknown;
    selftext: string;
    send_replies: boolean;
    spoiler: boolean;
    stickied: boolean;
    subreddit_id: string;
    subreddit_name_prefixed: string;
    subreddit_subscribers: number;
    subreddit_type: string;
    subreddit: string;
    suggested_sort?: unknown;
    thumbnail_height: number;
    thumbnail_width: number;
    thumbnail: string;
    title: string;
    total_awards_received: number;
    ups: number;
    url: string;
    user_reports: unknown[];
    view_count?: unknown;
    visited: boolean;
    whitelist_status?: unknown;
    wls?: unknown;
  }

  export interface RedditResponse<K extends 'comments' | 'posts'> {
    kind: string;
    data: {
      after: string;
      before: unknown;
      dist: number;
      modhash: string;
      kind: string;
      children: {
        kind: string;
        data: K extends 'comments' ? RedditComment : RedditPost;
      }[];
    };
  }

  export interface SpeedTestResponse {
    speeds: {
      download: number;
      upload: number;
      originalDownload: number;
      originalUpload: number;
    };
    client: {
      ip: string;
      lat: number;
      lon: number;
      isp: string;
      isprating: number;
      rating: number;
      ispdlavg: number;
      ispulavg: number;
      country: string;
    };
    server: {
      host: string;
      lat: number;
      lon: number;
      location: string;
      country: string;
      cc: string;
      sponsor: string;
      distance: number;
      distanceMi: string;
      ping: number;
      id: string;
    };
  }

  type OverwatchHeroesUnion =
    'ana' | 'brigitte' | 'junkrat' |
    'mei' | 'mercy' | 'moira' |
    'orisa' | 'reinhardt' | 'soldier76' |
    'symmetra' | 'torbjorn' | 'winston' |
    'wreckingBall' | string;

  interface OverwatchTopHeroStats {
    timePlayed: string;
    timePlayedInSeconds: number;
    gamesWon: number;
    winPercentage: number;
    weaponAccuracy: number;
    eliminationsPerLife: number;
    multiKillBest: number;
    objectiveKills: number;

    [topHeroStat: string]: StringOrNumber;
  }

  interface OverwatchAwardStats {
    cards: number;
    medals: number;
    medalsBronze: number;
    medalsSiver: number;
    medalsGold: number;

    [awardStat: string]: number;
  }

  interface OverwatchCareerAllHeroesAssists {
    defensiveAssists: number;
    defensiveAssistsAvgPer10Min: number;
    defensiveAssistsMostInGame: number;
    healingDone: number;
    healingDoneAvgPer10Min: number;
    healingDoneMostInGame: number;
    offensiveAssists: number;
    offensiveAssistsAvgPer10Min: number;
    offensiveAssistsMostInGame: number;

    [stat: string]: number;
  }

  interface OverwatchCareerAllHeroesAverage {
    allDamageDoneAvgPer10Min: number;
    barrierDamageDoneAvgPer10Min: number;
    deathsAvgPer10Min: number;
    eliminationsAvgPer10Min: number;
    finalBlowsAvgPer10Min: number;
    healingDoneAvgPer10Min: number;
    heroDamageDoneAvgPer10Min: number;
    objectiveKillsAvgPer10Min: number;
    objectiveTimeAvgPer10Min: string;
    soloKillsAvgPer10Min: number;
    timeSpentOnFireAvgPer10Min: string;

    [stat: string]: StringOrNumber;
  }

  interface OverwatchCareerAllHeroesBest {
    allDamageDoneMostInGame: number;
    barrierDamageDoneMostInGame: number;
    defensiveAssistsMostInGame: number;
    eliminationsMostInGame: number;
    environmentalKillsMostInGame: number;
    finalBlowsMostInGame: number;
    healingDoneMostInGame: number;
    heroDamageDoneMostInGame: number;
    killsStreakBest: number;
    meleeFinalBlowsMostInGame: number;
    multikillsBest: number;
    objectiveKillsMostInGame: number;
    objectiveTimeMostInGame: string;
    offensiveAssistsMostInGame: number;
    soloKillsMostInGame: number;
    teleporterPadsDestroyedMostInGame: number;
    timeSpentOnFireMostInGame: string;
    turretsDestroyedMostInGame: number;

    [stat: string]: StringOrNumber;
  }

  interface OverwatchCareerAllHeroesCombat {
    barrierDamageDone: number;
    damageDone: number;
    deaths: number;
    eliminations: number;
    environmentalKills: number;
    finalBlows: number;
    heroDamageDone: number;
    meleeFinalBlows: number;
    multikills: number;
    objectiveKills: number;
    objectiveTime: string;
    soloKills: number;
    timeSpentOnFire: string;

    [stat: string]: StringOrNumber;
  }

  interface OverwatchCareerAllHeroesGame {
    gamesLost: number;
    gamesPlayed: number;
    gamesTied: number;
    gamesWon: number;
    timePlayed: string;

    [stat: string]: StringOrNumber;
  }

  interface OverwatchCareerAllHeroesMatchAwards {
    cards: number;
    medals: number;
    medalsBronze: number;
    medalsGold: number;
    medalsSilver: number;

    [stat: string]: number;
  }

  interface OverwatchCareerAllHeroesMisc {
    teleporterPadsDestroyed: number;
    turretsDestroyed: number;

    [stat: string]: number;
  }


  interface OverwatchHeroStats {
    assists: OverwatchCareerAllHeroesAssists;
    average: OverwatchCareerAllHeroesAverage;
    best: OverwatchCareerAllHeroesBest;
    combat: OverwatchCareerAllHeroesCombat;
    deaths: unknown | null;
    heroSpecific: null;
    game: OverwatchCareerAllHeroesGame;
    matchAwards: OverwatchCareerAllHeroesMatchAwards;
    miscellaneous?: OverwatchCareerAllHeroesMisc;
  }

  interface OverwatchCareerStats {
    allHeroes: OverwatchHeroStats;

    [heroName: string]: OverwatchHeroStats;
  }

  interface OverwatchTopHeroes {
    [heroName: string]: OverwatchTopHeroStats;
  }

  interface OverwatchGamesStats {
    played: number;
    won: number;

    [gameStats: string]: number;
  }

  interface OverwatchStatsGroup {
    awards: OverwatchAwardStats;
    careerStats: OverwatchCareerStats;
    games: OverwatchGamesStats;
    topHeroes: OverwatchTopHeroes;
  }

  export interface OverwatchData {
    error: unknown;
    endorsement: number;
    endorsementIcon: string;
    gamesWon: number;
    icon: string;
    level: number;
    levelIcon: string;
    name: string;
    prestige: number;
    prestigeIcon: string;
    private: boolean;
    rating: number;
    ratingIcon: string;
    ratingName?: string;
    competitiveStats: OverwatchStatsGroup;
    quickPlayStats: OverwatchStatsGroup;
  }

  type PubgSetTypeUnion = 'season' | 'player' | 'playerSeason';

  interface PubgSeasonSet {
    type: Exclude<PubgSetTypeUnion, 'playerSeason' | 'player'>;
    id: string;
    attributes: {
      isCurrentSeason: boolean;
      isOffSeason: boolean;
    };
  }

  interface PubgPlayerSet {
    type: Exclude<PubgSetTypeUnion, 'playerSeason' | 'season'>;
    id: string;
    attributes: {
      name: string;
      stats: unknown;
      titleId: string;
      shardId: string;
      createdAt: string;
      updatedAt: string;
      patchVersion: string;
    };
    relationships: {
      assets: {
        data: unknown[];
      };
      matches: {
        data: unknown[];
      };
    };
  }

  interface PubgStatistics {
    assists: number;
    bestRankPoint: number;
    boosts: number;
    dBNOs: number;
    dailyKills: number;
    dailyWins: number;
    damageDealt: number;
    days: number;
    headshotKills: number;
    heals: number;
    killPoints: number;
    kills: number;
    longestKill: number;
    longestTimeSurvived: number;
    losses: number;
    maxKillStreaks: number;
    mostSurvivalTime: number;
    rankPoints: number;
    rankPointsTitle: string;
    revives: number;
    rideDistance: number;
    roadKills: number;
    roundMostKills: number;
    roundsPlayed: number;
    suicides: number;
    swimDistance: number;
    teamKills: number;
    timeSurvived: number;
    top10s: number;
    vehicleDestroys: number;
    walkDistance: number;
    weaponsAcquired: number;
    weeklyKills: number;
    weeklyWins: number;
    winPoints: number;
    wins: number;
  }

  interface PubgPlayerStatsSet {
    type: Exclude<PubgSetTypeUnion, 'season' | 'player'>;
    attributes: {
      gameModeStats: {
        duo: PubgStatistics;
        'duo-fpp': PubgStatistics;
        solo: PubgStatistics;
        'solo-fpp': PubgStatistics;
        squad: PubgStatistics;
        'squad-fpp': PubgStatistics;
      };
    };
    relationships: {
      matchesSquad: { data: unknown };
      matchesSquadFPP: { data: unknown };
      season: {
        data: {
          type: Exclude<PubgSetTypeUnion, 'playerSeason' | 'player'>;
          id: string;
        };
      };
      player: {
        data: {
          type: Exclude<PubgSetTypeUnion, 'playerSeason' | 'season'>;
          id: string;
        };
      };
      matchesSolo: { data: unknown };
      matchesSoloFPP: { data: unknown };
      matchesDuo: { data: unknown };
      matchesDuoFPP: { data: unknown };
    };
  }

  export interface PubgData<K extends PubgSetTypeUnion> {
    data: K extends Exclude<PubgSetTypeUnion, 'playerSeason' | 'player'>
      ? PubgSeasonSet[]
      : K extends Exclude<PubgSetTypeUnion, 'playerSeason' | 'season'>
        ? PubgPlayerSet[]
        : PubgPlayerStatsSet;
    links: {
      self: string;
      schema: string;
    };
    meta: {};
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

  export interface NekoData {
    url: string;
  }
}