module.exports = {
  mode: "development",
  devServer: {
    contentBase: './public',
    compress: false,
    port: 8080,
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