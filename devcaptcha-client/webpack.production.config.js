module.exports = {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: 'devcaptcha.dist.js'
  },
  resolve: {
    extensions: [".ts", ".tsx", '.js', '.json']
  },
  module: {
    rules: [{
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      use: [{
        loader: "ts-loader"
      }]
    }, {
      enforce: "pre",
      test: /\.js$/,
      loader: "source-map-loader"
    }]
  },
};