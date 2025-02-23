const path = require("path")
const copyWebpackPlugin = require("copy-webpack-plugin")
module.exports = {
    watch: true,
    resolve: {
        alias: {
            "@*": path.resolve(__dirname, "./src/*")
        }
    },
    mode: "development",
    entry: {
        "feature_manager": "./src/content_scripts/js/feature_manager.js",
    },
    devtool: "inline-source-map",
    output: {
        filename: "content_scripts/js/[name].js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    plugins: [
        new copyWebpackPlugin({
            patterns: [
                {
                    from: "./src",
                    to: ".",
                    globOptions: {
                        ignore: [
                            "**/modules"
                        ]
                    }
                }
            ]
        })
    ],
} 