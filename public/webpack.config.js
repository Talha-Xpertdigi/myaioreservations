const path = require('path');

module.exports = {
  mode: 'production',
  entry: "./src/components/frontend/widget.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "webpack.config.js",
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          }
        },
      },
      {
        test: /\.css$/, 
        use: ['style-loader', 'css-loader'],
      },

    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};


