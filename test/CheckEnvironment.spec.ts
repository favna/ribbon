/* tslint:disable:no-unused-expression no-implicit-dependencies*/

import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';

suite('Verify Environment Variables', () => {
    test('Bot Token should be accessible', () => expect(typeof process.env.BOT_TOKEN).to.equal('string'));
    test('Test Bot Token should be accessible', () => expect(typeof process.env.TEST_TOKEN).to.equal('string'));
    test('Issue Log Channel ID should be accessible', () => expect(typeof process.env.ISSUE_LOG_CHANNEL_ID).to.equal('string'));
    test('Ratelimits Log Channel ID should be accessible', () => expect(typeof process.env.RATELIMIT_LOG_CHANNEL_ID).to.equal('string'));
    test('Google API Key should be accessible', () => expect(typeof process.env.GOOGLE_API_KEY).to.equal('string'));
    test('Image Searchengine Key should be accessible', () => expect(typeof process.env.IMAGE_KEY).to.equal('string'));
    test('Searchengine Key should be accessible', () => expect(typeof process.env.SEARCH_KEY).to.equal('string'));
    test('OXR API Key volume should be accessible', () => expect(typeof process.env.OXR_API_KEY).to.equal('string'));
    test('MovieDB API Key should be accessible', () => expect(typeof process.env.MOVIEDB_API_KEY).to.equal('string'));
    test('Steam API Key should be accessible', () => expect(typeof process.env.STEAM_API_KEY).to.equal('string'));
    test('IGDB API Key should be accessible', () => expect(typeof process.env.IGDB_API_KEY).to.equal('string'));
    test('Discord Bots API Key should be accessible', () => expect(typeof process.env.DISCORD_BOTS_API_KEY).to.equal('string'));
    test('TimezoneDB API Key should be accessible', () => expect(typeof process.env.TIMEZONE_DB_API_KEY).to.equal('string'));
    test('OSU API Key should be accessible', () => expect(typeof process.env.OSU_API_KEY).to.equal('string'));
    test('DarkSky API Key should be accessible', () => expect(typeof process.env.DARK_SKY_API_KEY).to.equal('string'));
    test('Random.org API Key should be accessible', () => expect(typeof process.env.RANDOM_ORG_API_KEY).to.equal('string'));
    test('PUBG API Key should be accessible', () => expect(typeof process.env.PUBG_API_KEY).to.equal('string'));
    test('TRN API Key should be accessible', () => expect(typeof process.env.TRN_API_KEY).to.equal('string'));
    test('Kitsu ID should be accessible', () => expect(typeof process.env.KITSU_ID).to.equal('string'));
    test('Kitsu Key should be accessible', () => expect(typeof process.env.KITSU_KEY).to.equal('string'));
    test('Twitch Client ID should be accessible', () => expect(typeof process.env.TWITCH_CLIENT_ID).to.equal('string'));
    test('Spotify ID should be accessible', () => expect(typeof process.env.SPOTIFY_ID).to.equal('string'));
    test('Spotify Secret should be accessible', () => expect(typeof process.env.SPOTIFY_SECRET).to.equal('string'));
    test('Default volume should be accessible', () => expect(typeof process.env.DEFAULT_VOLUME).to.equal('string'));
    test('Max Length should be accessible', () => expect(typeof process.env.MAX_LENGTH).to.equal('string'));
    test('Max Songs should be accessible', () => expect(typeof process.env.MAX_SONGS).to.equal('string'));
    test('Paginated Items should be accessible', () => expect(typeof process.env.PAGINATED_ITEMS).to.equal('string'));
    test('Passes should be accessible', () => expect(typeof process.env.PASSES).to.equal('string'));
});