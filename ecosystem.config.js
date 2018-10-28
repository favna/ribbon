/* eslint-disable camelcase */

module.exports = {
  apps: [
    {
      name: 'Ribbon',
      script: './src/app.js',
      node_args: '-r esm --experimental-modules'
    }
  ]
};