/* eslint-disable one-var */

const deleteCommandMessages = function (msg, client) { // eslint-disable-line consistent-return
	if (msg.deletable && client.provider.get(msg.guild, 'deletecommandmessages', false)) {
		return msg.delete();
	}
};

const capitalizeFirstLetter = function (string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * FetchColor - fetches the most vibrant color from an image
 * Currently deprecated in Ribbon in favor of response speed
 * If Node-Vibrant speeds up it may return
 */

/*
 * const fetchColor = async function (img, defaultColor) {
 * const vibrant = require('node-vibrant'); // eslint-disable-line global-require
 *
 * let color = defaultColor,
 * palette = '';
 *
 * try {
 * palette = await vibrant.from(img).getPalette();
 * } catch (err) {
 * return color;
 * }
 *
 * if (palette) {
 * const pops = [],
 * swatches = Object.values(palette);
 *
 * let prominentSwatch = {};
 *
 * for (const swatch in swatches) {
 * if (swatches[swatch]) {
 * pops.push(swatches[swatch]._population); // eslint-disable-line no-underscore-dangle
 * }
 * }
 *
 * const highestPop = pops.reduce((a, b) => Math.max(a, b)); // eslint-disable-line one-var
 *
 * for (const swatch in swatches) {
 * if (swatches[swatch]) {
 * if (swatches[swatch]._population === highestPop) { // eslint-disable-line no-underscore-dangle
 * prominentSwatch = swatches[swatch];
 * break;
 * }
 * }
 * }
 * color = prominentSwatch.getHex();
 * }
 *
 * return color;
 * };
 */

module.exports = {
	capitalizeFirstLetter,
	deleteCommandMessages	
};