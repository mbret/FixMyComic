const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// rules.push({
//   test: /\.jpe?g$|\.gif$|\.ico$|\.png$|\.svg$/,
//   use: 'file-loader?name=[name].[ext]?[hash]'
// });

// rules.push({
//   test: /\.(woff|woff2|eot|ttf|otf)$/,
//   use: 'file-loader',
// });

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.png']
  },
};
