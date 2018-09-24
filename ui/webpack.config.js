const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const extractCSS = new ExtractTextPlugin('[name].fonts.css');
const extractSCSS = new ExtractTextPlugin('[name].styles.css');

const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

console.log('BUILD_DIR', BUILD_DIR);
console.log('SRC_DIR', SRC_DIR);

module.exports = (env = {}) => {
  return {
    entry: {
      index: [SRC_DIR + '/index.js']
    },
    output: {
      path: BUILD_DIR,
      publicPath: '/ui/',
      filename: '[name].bundle.js'
    },
    // watch: true,
    devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',
    devServer: {
      contentBase: BUILD_DIR,
      historyApiFallback: true,
      //   port: 9001,
      compress: true,
      hot: true,
      open: true,
      proxy: { // 联调中跨域问题解决,接口语法和Nginx基本一致。
        '/api/*': {
            changeOrigin: true,
            target: 'http://localhost:8800',
            secure: false,
        },
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['react', 'env']
            }
          }
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.(scss)$/,
          use: ['css-hot-loader'].concat(extractSCSS.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {alias: {'../img': '../public/img'}}
              },
              {
                loader: 'sass-loader'
              }
            ]
          }))
        },
        {
          test: /\.css$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          use: [
            {
              // loader: 'url-loader'
              loader: 'file-loader',
              options: {
                name: './img/[name].[hash].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader',
          options: {
            name: './fonts/[name].[hash].[ext]'
          }
        }]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      extractCSS,
      extractSCSS,
      new ExtractTextPlugin({
        filename:'[name].[hash].css',
        allChunks:true
      }),
      new HtmlWebpackPlugin(
        {
          inject: true,
          template: './public/index.html'
        }
      ),
      new CopyWebpackPlugin([
          {from: './public/img', to: 'img'}
        ],
        {copyUnmodified: false}
      )
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: false
                }
            })
        ]
    },
  }
};
