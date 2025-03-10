const path = require('path');
var ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: './src/vs_plugin.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'vs_plugin.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new ZipPlugin({
            filename: 'UnpackMe_vs_plugin.zip'
        })
    ],
    optimization: {
        minimize: false
    },
    externals: {
        'three': 'THREE' 
    }
    // Additional configuration goes here
};