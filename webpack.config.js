const path = require('path');
var ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: false,
    target: 'node',
    entry: './src/vs_plugin.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: { 
                    reportFiles: ['src/**/*.{ts,tsx}'] 
                },               
            },
        ],
    },

    output: {
        filename: 'vs_plugin.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new ZipPlugin({
            filename: 'UnpackMe_vs_plugin.zip'
        })
    ],
    optimization: {
        minimize: false
    },
    // Additional configuration goes here
};