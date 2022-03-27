const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");
const assets = ['public']; // asset directories

module.exports = [new ForkTsCheckerWebpackPlugin(), new CopyWebpackPlugin({
    patterns: assets.map(asset => {
        return {
            from: path.resolve(__dirname, asset),
            to: path.resolve(__dirname, '.webpack/renderer', asset)
        }
    })
})];
