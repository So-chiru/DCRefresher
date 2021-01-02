const path = require('path')
const fs = require('fs')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const dev = process.env.NODE_ENV !== 'production'
const pkg = JSON.parse(fs.readFileSync('./package.json'))

const options = {
  entry: {
    refresher: ['babel-polyfill', path.resolve('src', 'index.ts')]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        exclude: /(node_modules|_old_src|(sa|sc|c)ss|background)/,
        test: /\.js|\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript']
          }
        }
      },
      {
        exclude: /\.js|\.ts|\.woff2/,
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(ico|png|jpg|jpeg)?$/,
        loader: 'file-loader',
        options: {
          name: '[hash].[ext]'
        }
      },
      {
        test: /\.json?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          globals: {
            RefresherVersion: pkg.version || '1.0.0'
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'refresher.bundle.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          transform: (content, _p) => {
            return Buffer.from(
              JSON.stringify({
                description: pkg.description,
                version: pkg.version,
                ...JSON.parse(content.toString())
              })
            )
          }
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets',
          to: 'assets/'
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/root',
          to: './'
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/views/index.pug',
      filename: 'views/index.html',
      inject: false,
      templateParameters: {
        RefresherVersion: pkg.version || '1.0.0'
      }
    })
    // new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.js', '.ts', '.css'],
    modules: ['node_modules'],
    alias: {
      vue: 'vue/dist/vue.js'
    }
  }
}

module.exports = (env, argv) => {
  options.mode = argv.mode

  if (argv.mode === 'development') {
    options.devtool = 'eval-source-map'
  }

  if (argv.mode === 'production') {
    options.resolve.alias['vue'] = 'vue/dist/vue.min.js'

    delete options.devServer
  }

  return options
}