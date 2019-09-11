import { Song } from '@utils/Utils';
import { TextChannel, VoiceChannel, VoiceConnection } from 'discord.js';
import { Command } from 'klasa';

export type MusicCommand = {
  queue: Map<string, MusicQueueType>;
  votes: Map<string, MusicVoteType>;
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
  users: string[];
  queue: MusicQueueType;
  guild: string;
  start: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeout: any;
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
    etag: string;
    id: YoutubeVideoResourceType;
    kind: string;
    snippet: YoutubeVideoSnippetType;
  }[];
  kind: string;
  nextPageToken: string;
  pageInfo: { resultsPerPage: number; totalResults: number };
  regionCode: string;
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