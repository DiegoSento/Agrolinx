// Configuración de Webpack para optimización de JavaScript
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    'critical-minimal': './scripts/critical-minimal.js',
    'module-loader': './scripts/module-loader.js',
    'gallery-module': './scripts/gallery-module.js',
    'form-module': './scripts/form-module.js'
  },
  output: {
    path: path.resolve(__dirname, 'scripts/dist'),
    filename: '[name].min.js',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2
          },
          mangle: {
            toplevel: true,
            properties: {
              regex: /^_/
            }
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  }
};