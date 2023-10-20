const path = require('path');
const {ProvidePlugin} = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = (env, argv) => {
  const dev = argv.mode !== "production";
  return {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {            
            getCustomTransformers: () => ({ before: [styledComponentsTransformer] })
          }
        },
        {
          test: /\.css$/,
          type: 'asset/source'
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
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared')
      }
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
