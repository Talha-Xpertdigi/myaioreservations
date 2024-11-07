const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  // other webpack configuration...
  plugins: [
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '../../../build/static/js',  // Adjust to the path where your JS files are served
      generate: (seed, files) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);

        return manifestFiles;
      }
    }),
  ],
};
