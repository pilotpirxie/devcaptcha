module.exports = {
  mode: "development",
  devtool: "source-map",
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
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "pixi.js": "PIXI"
  }
};