/**
 * @file Ribbon Applet - initiates an instance of Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna  
 */

/* eslint-disable no-mixed-requires, one-var */
const path = require('path');

require('dotenv').config({path: path.join(__dirname, '.env')});
const Ribbon = require(path.join(__dirname, 'Ribbon.js')),
  start = function () {
    new Ribbon(process.argv[2] ? process.env.stripetoken : process.env.ribbontoken).init();
  };

start();