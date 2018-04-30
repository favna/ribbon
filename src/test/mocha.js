/**
 * @file Ribbon Tests - Test Ribbon with Mocha
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 *  
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License  
 *  
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.  
 *  
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.  
 *  
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:  
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.  
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.  
 */

/* eslint-disable no-undef, no-unused-vars, sort-vars, no-mixed-requires, global-require*/

const Database = require('better-sqlite3'),
  assert = require('assert'),
  should = require('chai').should(),
  path = require('path'),
  {expect} = require('chai'),
  {Client, SyncSQLiteProvider} = require('discord.js-commando');

beforeEach('Injecting dotenv', () => {
  require('dotenv').config({path: path.join(__dirname, '../.env')});
});

describe('Check dotenv', () => {
  it('ribbon token should be set', () => {
    const token = process.env.ribbontoken;

    expect(token).to.be.ok;
  });
  it('google api token should be set', () => {
    const token = process.env.googleapikey;

    expect(token).to.be.ok;
  });
});

describe('Connect & Disconnect bot', () => {
  it('should connect then disconnect', () => {
    const client = new Client({
        commandPrefix: 's!!',
        owner: '112001393140723712',
        selfbot: false,
        unknownCommandResponse: false
      }),
      db = new Database(path.join(__dirname, '../data/databases/settings.sqlite3'));

    client.setProvider(
      new SyncSQLiteProvider(db)
    );
    let readyTracker = false;

    client.registry.registerDefaults();
    client.login(process.env.stripetoken);

    client.on('ready', () => {
      client.destroy();
      readyTracker = true;
      expect(readyTracker).to.be.ok;
    });
  });
});