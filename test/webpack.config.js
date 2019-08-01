const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname),
    filename: 'output.js',
  },
  module: {
    rules: [
      {
        test: /\.(glsl)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          {
            loader: path.resolve(__dirname, '../dist/index'),
            options: {
              comment: true,
              whitespace: true,
              crlf: false,
              ignore: [
                // three.js glsl macro
                '#include <'
              ]
            }
          }
        ],
      }
    ]
  },
  optimization: {
    minimize: false
  }
};
