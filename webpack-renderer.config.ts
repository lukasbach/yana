import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

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
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './index.html',
    }),
  ],
  externals: {
    "archiver": "require('archiver')",
    "unzip": "require('unzip')"
  }
};

export default config;
