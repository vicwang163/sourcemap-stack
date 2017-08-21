var path = require('path')
module.exports = {
  entry: {
    'index': './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'lib'),
    libraryTarget: 'commonjs',
    filename: '[name].js'
  },
  target: 'node',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}