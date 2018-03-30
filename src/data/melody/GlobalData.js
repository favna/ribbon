
/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
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
 * * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */
const {googleapikey} = require('../../auth.json');

const DEFAULT_VOLUME = 1, // eslint-disable-line one-var
  GOOGLE_API = googleapikey,
  MAX_LENGTH = 10,
  MAX_SONGS = 3,
  PAGINATED_ITEMS = 5,
  PASSES = 3;
	
module.exports = {
  DEFAULT_VOLUME,
  GOOGLE_API,
  MAX_LENGTH,
  MAX_SONGS,
  PAGINATED_ITEMS,
  PASSES
};