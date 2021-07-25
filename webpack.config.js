const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    // open: true,
    host: 'localhost',
    contentBase: path.resolve(__dirname, 'serve'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './serve/index.html',
    }),
  ],
  module: {
    parser: {
      javascript: {
        worker: ['AudioWorkletUrl from audio-worklet', '...'],
      },
    },
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler,'css-loader'],
      },
      {
        test: /\.(wav|eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'audio-worklet': path.resolve(__dirname, 'src/worklets/index.ts'),
    },
  },
  experiments: {
    topLevelAwait: true,
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
