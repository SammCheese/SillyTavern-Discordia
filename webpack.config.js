const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = (env, argv) => {
  const config = {
    entry: path.join(__dirname, 'src/index.tsx'),
    devtool: isProduction ? false : 'source-map',
    output: {
      module: true,
      clean: true,
      path: path.join(__dirname, 'dist/'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    experiments: {
      topLevelAwait: true,
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                compilerOptions: {
                  noEmit: false,
                },
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.webm$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        imports: [path.resolve(__dirname, 'src/import.ts'), 'imports'],
        dislog: [path.resolve(__dirname, 'src/utils/logger.ts'), 'dislog'],
      }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: '[name].css' })]
        : []),
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      usedExports: true,
    },
  };

  if (argv.mode === 'development') {
    config.optimization.minimize = false;
  }

  return config;
};
