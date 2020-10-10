const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack')

module.exports = {
  externals: [nodeExternals()],
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ],
};