const path = require('path');
const {ProvidePlugin} = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const dev = argv.mode !== "production";
  return {
    entry: './src/index.tsx',
    module: {
      rules: [
       
        {
          test: /\.tsx?$/i,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            dev ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
              }
            },
            'postcss-loader',
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Query editor',
      }),
      new ProvidePlugin({
        React: 'react'
      }),
      new MiniCssExtractPlugin()
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
      compress: true,
      port: 9000,
    },
  };
}
