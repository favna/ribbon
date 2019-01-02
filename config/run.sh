#!/usr/bin/env bash
if ! [[ -d dist ]]
  then
    yarn build && node './dist/app.js';
  else
    node './dist/app.js';
fi;