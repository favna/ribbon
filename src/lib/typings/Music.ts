import { Song } from '@utils/Utils';
import { TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command } from 'klasa';

export type MusicCommand = {
  queue: Map<string, MusicQueueType>;
  votes: Map<string, MusicVoteType>;
} & Command;

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
  users: string[];
  queue: MusicQueueType;
  guild: string;
  start: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeout: any;
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
    etag: string;
    id: YoutubeVideoResourceType;
    kind: string;
    snippet: YoutubeVideoSnippetType;
  }[];
  kind: string;
  nextPageToken: string;
  pageInfo: { resultsPerPage: number; totalResults: number };
  regionCode: string;
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