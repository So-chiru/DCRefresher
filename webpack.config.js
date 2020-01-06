const path = require('path')
const fs = require('fs')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const dev = process.env.NODE_ENV !== 'production'
const pkg = JSON.parse(fs.readFileSync('./package.json'))

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve('src', 'index.js'),
  output: {
    filename: 'refresher.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        exclude: /(node_modules|_old_src|(sa|sc|c)ss)/,
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        exclude: /\.js/,
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
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'refresher.bundle.css'
    }),
    new CopyWebpackPlugin([
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
    ]),
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets/'
      }
    ])
  ],
  resolve: {
    extensions: ['.js', '.css'],
    modules: ['node_modules']
  }
}
