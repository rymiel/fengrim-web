const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

var PACKAGE = require("./package.json");
var version = PACKAGE.version;

const config = {
  entry: path.join(__dirname, "src", "index.tsx"),
  target: "web",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.ttf$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@blueprintjs": path.resolve(__dirname, "./node_modules/@blueprintjs"),
    },
    modules: [path.join(__dirname, "./src"), path.join(__dirname, "./node_modules")],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build", "static"),
    publicPath: "/static/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
      filename: path.join(__dirname, "build", "index.html"),
    }),
    new webpack.EnvironmentPlugin({ API_URL: null }),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      WEB_VERSION: JSON.stringify(version),
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.devtool = "inline-source-map";
    config.devServer = {
      static: path.join(__dirname, "build"),
      hot: true,
      port: 3002,
      historyApiFallback: {
        index: "index.html",
      },
    };
  } else if (argv.mode === "production") {
    config.optimization = {
      splitChunks: {
        chunks: "all",
      },
    };
  }
  return config;
};
