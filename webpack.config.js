const path = require('path');

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname + "/js"),
    filename: 'bundleV2.js'
  }
};