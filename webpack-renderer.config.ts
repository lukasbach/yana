import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

const config: webpack.Configuration = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  entry: './src/index.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 4000,
    publicPath: '/',
  },
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: 'js/[name].js',
    publicPath: './',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './index.html',
    }),
    new MonacoWebpackPlugin(),
    new webpack.IgnorePlugin(
      new RegExp('^(mssql*|mariasql|.oracle.|mssql/.*|tedious|node-pre-gyp)$')
      // new RegExp('^(mssql*|mariasql|.oracle.|sqlite3|mssql/.*|tedious|node-pre-gyp)$')
    ),
  ],
  externals: {
    archiver: 'archiver',
    unzip: 'unzip',

    // Possible drivers for knex - we'll ignore them
    sqlite3: 'sqlite3',
    mariasql: 'mariasql',
    mssql: 'mssql',
    mysql: 'mysql',
    oracle: 'oracle',
    'strong-oracle': 'strong-oracle',
    oracledb: 'oracledb',
    pg: 'pg',
    'pg-query-stream': 'pg-query-stream',
    tedious: 'tedious',
    mysql2: 'mysql2',
    'mssql/package.json': 'mssql/package.json',
    'mssql/lib/base': 'mssql/lib/base',

    'aws-sdk': 'aws-sdk',
    'node-pre-gyp': 'node-pre-gyp',
    // '../package': '../package',
  },
};

export default config;
