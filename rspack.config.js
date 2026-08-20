import { rspack } from '@rspack/core';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  experiments: {
    css: true,
  },
  output: {
    publicPath: '',
    clean: true,
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      favicon: path.join('src', 'assets', 'favicon.ico'),
      template: path.join('src', 'index.html'),
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: 'data', to: 'audio' },
      ],
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
        test: /\.(flac|mp3|mp4|m4a|opus|wav|png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
        type: 'asset/resource',
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
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
