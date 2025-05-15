const path = require('path');
const { rspack } = require('@rspack/core');

module.exports = {
  entry: './src/index.ts',
  experiments: {
    css: true,
  },
  output: {
    publicPath: '',
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      favicon: './serve/favicon.ico',
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
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(wav|eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'audio-worklet': path.resolve(__dirname, 'src/worklets/index.ts'),
    },
  },
};
