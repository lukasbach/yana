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
    libraryTarget: 'commonjs2',
  },
  plugins: [
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
