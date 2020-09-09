import * as path from 'path';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module'],
  },
  entry: './src/electron-main.ts',
  target: 'electron-main',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'electron-main.js',
    publicPath: './',
  },
};

export default config;
