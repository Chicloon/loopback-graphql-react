const webpack = require('webpack');
const path = require('path');

const clientPath = path.resolve(__dirname, 'client');
const publicPath = path.resolve(clientPath, 'public');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

module.exports = {
	cache: true,
	devtool: 'eval-source-map',
	entry: [
		'react-hot-loader/patch',
		// activate HMR for React

		// 'webpack-dev-server/client?http://localhost:3000',
		// bundle the client for webpack-dev-server
		// and connect to the provided endpoint

		'webpack/hot/only-dev-server',
		// bundle the client for hot reloading
		// only- means to only hot reload for successful updates

		'babel-polyfill',
		path.join(clientPath, 'index'),
	],
	output: {
		path: path.join(publicPath, 'js'),
		filename: 'bundle.js',
		publicPath: '/',
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(),
		new InterpolateHtmlPlugin({
			PUBLIC_URL: ''
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve(publicPath, 'index.html'),
		}),
	],
	devServer: {
		contentBase: path.join(__dirname, 'client/public'),
		historyApiFallback: true,
		host: '0.0.0.0',
		disableHostCheck: true,
		publicPath: '/',
		hot: true,
		port: 3000,
		compress: false,
		proxy: {
			'/api': 'http://localhost:4444',
			'/graphql': 'http://localhost:4000'
		},
		stats: {
			colors: true,
			assets: false,
			// version: false,
			// hash: false,
			// timings: false,
			chunks: false,
			chunkModules: false
		}
	},
	performance: {
		hints: false
	},
	module: {
		rules: [
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
				test: /\.js$/,
				include: clientPath,
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
				test: /\.s?css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" },
					{ loader: "sass-loader" },
				],
			},
			{
				test: /\.less$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" },
					{ loader: "less-loader" },
				],
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
