module.exports = function (context, options) {
    return {
      name: 'yaml-loader',
      configureWebpack(config, isServer, utils) {
        return {
          module: {
            rules: [
              {
                test: /\.yaml$/,
                use: ['raw-loader'],
              },
            ],
          },
        };
      },
    };
  };