const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');


minify({
  compressor: terser,
  input: ['src/index.js','src/sample.js'],
  output: ['dist/bundle.js','dist/sample.js'],
  callback: function(err, min) {}
});
