const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const clientPath = path.resolve(__dirname, 'client');
const buildPath = path.resolve(__dirname, 'build');

let extractBootstrap = new ExtractTextPlugin('static/css/bootstrap.css');
let extractCSS = new ExtractTextPlugin('static/css/style.[hash:8].css');

module.exports = {
	cache: true,
	devtool: 'cheap-eval-source-map', // все работает, да еще и билдится быстро
	// devtool: 'cheap-source-map', // ломает код
	// devtool: 'nosources-source-map', // ломает код
	entry: {
		bundle: [
			'babel-polyfill',
			path.join(clientPath, 'index'),
		],
		vendor: [
			'react',
			'react-dom',
			'moment',
			'draft-js',
			'react-draft-wysiwyg',
		]
	},
	output: {
		path: buildPath,
		publicPath: '/',
		filename: 'static/js/[name].[chunkhash:8].js',
		chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
	},
	plugins: [
		new InterpolateHtmlPlugin({
			PUBLIC_URL: ''
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve(clientPath, 'public/index.html'),
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity,
			publicPath: '/static/js',
			filename: 'static/js/vendor.bundle.js',
		}),
		extractCSS,
		extractBootstrap,
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [
					clientPath,
					path.resolve(__dirname, 'i18n'),
				],
				use: [
					{
						loader: 'babel-loader',
						query: {
							cacheDirectory: true,
						}
					}
				],
			},
			{
				exclude: [
					/\.html$/,
					/\.(js|jsx)$/,
					/\.css$/,
					/\.scss$/,
					/\.less$/,
					/\.json$/,
					/\.svg$/
				],
				use: [
					{
						loader: 'url-loader',
						query: {
							limit: 10000,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
				]
			},
			{
				include: [
					/bootstrap\.css$/,
				],
				use: extractBootstrap.extract({
					use: [
						{
							loader: 'css-loader',
						}
					]
				})
			},
			{
				test: /\.s?css$/,
				exclude: [
					/bootstrap\.css$/,
				],
				use: extractCSS.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								modules: true,
								importLoaders: true,
								localIdentName: '[local]',
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				})
			},
			{
				test: /\.less$/,
				use: extractCSS.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								modules: true,
								importLoaders: true,
								localIdentName: '[local]',
							}
						},
						{
							loader: 'less-loader',
							options: {
								sourceMap: true
							}
						}
					]
				})
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'file-loader',
						query: {
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
				],
			},
		]
	},
};

