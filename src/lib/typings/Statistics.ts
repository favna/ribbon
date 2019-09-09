import { StringOrNumber } from './General';

export type FortniteStatsType = {
  key: string;
  value: string;
};

export type RedditAbout = {
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
};

export type RedditComment = {
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
};


export type RedditPost = {
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
};

export type RedditResponse<K extends 'comments' | 'posts'> = {
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
};

export type SpeedTestResponse = {
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
};

type OverwatchTopHeroStats = {
  timePlayed: string;
  timePlayedInSeconds: number;
  gamesWon: number;
  winPercentage: number;
  weaponAccuracy: number;
  eliminationsPerLife: number;
  multiKillBest: number;
  objectiveKills: number;

  [topHeroStat: string]: StringOrNumber;
};

type OverwatchAwardStats = {
  cards: number;
  medals: number;
  medalsBronze: number;
  medalsSiver: number;
  medalsGold: number;

  [awardStat: string]: number;
};

type OverwatchCareerAllHeroesAssists = {
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
};

type OverwatchCareerAllHeroesAverage = {
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
};

type OverwatchCareerAllHeroesBest = {
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
};

type OverwatchCareerAllHeroesCombat = {
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
};

type OverwatchCareerAllHeroesGame = {
  gamesLost: number;
  gamesPlayed: number;
  gamesTied: number;
  gamesWon: number;
  timePlayed: string;

  [stat: string]: StringOrNumber;
};

type OverwatchCareerAllHeroesMatchAwards = {
  cards: number;
  medals: number;
  medalsBronze: number;
  medalsGold: number;
  medalsSilver: number;

  [stat: string]: number;
};

type OverwatchCareerAllHeroesMisc = {
  teleporterPadsDestroyed: number;
  turretsDestroyed: number;

  [stat: string]: number;
};


type OverwatchHeroStats = {
  assists: OverwatchCareerAllHeroesAssists;
  average: OverwatchCareerAllHeroesAverage;
  best: OverwatchCareerAllHeroesBest;
  combat: OverwatchCareerAllHeroesCombat;
  deaths: unknown | null;
  heroSpecific: null;
  game: OverwatchCareerAllHeroesGame;
  matchAwards: OverwatchCareerAllHeroesMatchAwards;
  miscellaneous?: OverwatchCareerAllHeroesMisc;
};

type OverwatchCareerStats = {
  allHeroes: OverwatchHeroStats;

  [heroName: string]: OverwatchHeroStats;
};

type OverwatchTopHeroes = {
  [heroName: string]: OverwatchTopHeroStats;
};

type OverwatchGamesStats = {
  played: number;
  won: number;

  [gameStats: string]: number;
};

type OverwatchStatsGroup = {
  awards: OverwatchAwardStats;
  careerStats: OverwatchCareerStats;
  games: OverwatchGamesStats;
  topHeroes: OverwatchTopHeroes;
};

export type OverwatchData = {
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
};

type PubgSetTypeUnion = 'season' | 'player' | 'playerSeason';

type PubgSeasonSet = {
  type: Exclude<PubgSetTypeUnion, 'playerSeason' | 'player'>;
  id: string;
  attributes: {
    isCurrentSeason: boolean;
    isOffSeason: boolean;
  };
};

type PubgPlayerSet = {
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
};

type PubgStatistics = {
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
};

type PubgPlayerStatsSet = {
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
};

export type PubgData<K extends PubgSetTypeUnion> = {
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
};