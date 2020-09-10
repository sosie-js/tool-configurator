const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');


minify({
  compressor: terser,
  input: ['src/index.js','src/index.js'],
  output: ['dist/bundle.js','dist/bundle.js'],
  callback: function(err, min) {}
});
