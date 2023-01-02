var HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require("path");
const bundleOutputDir = "./dist";

module.exports = {
    entry: {
        main: "./src/App"  
    },
    output: {
        filename: "[name].bundle.js",
        path: path.join(__dirname, bundleOutputDir),
        publicPath: 'dist/'
    },
    //devtool: "source-map",
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['/node_modules/']
            },
            {
                test: /\.ts$/,
                exclude: ['/node_modules/']
            }, 
            { test: /\.tsx?$/, loader: "ts-loader" },        
            {
                test: /\.css$/,
                sideEffects: true,
                loader: "css-loader"
            },
            {
                test: /\.wgsl$/,
                use: 'raw-loader'
            },
            {
                test: /\.jpg$/,
                use: 'raw-loader'
            }
        ]
    },
    mode: 'development',
    devtool: 'inline-source-map',
    optimization: {
        minimize: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, 'sample.html'),
            template: path.resolve(__dirname, 'template.html'),
            minify: false,
            hash: true
        })
    ]
};