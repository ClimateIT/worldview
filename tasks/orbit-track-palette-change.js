var fs = require('fs');
var nodeDir = require('node-dir');
var palette = { immutable: true };
nodeDir.readFiles('./config/default/common/config/wv.json/layers/reference/orbits', // the root path
  {
    match: /.json$/, // only match orbit tracks
    include: /OrbitTracks/,
    recursive: false // only the root dir
  },

  function (err, content, filename, next) {
    console.log(filename);
    if (err) {
      console.warn(err);
    } else {
      var json = JSON.parse(content);

      var layers = json.layers;
      var keys = Object.keys(layers);
      for (var i = 0, length = keys.length; i < length; i++) {
        const layer = layers[keys[i]];
        layer.palette = palette;
        layer.palette.id = layer.id;
      }
      var jsonDone = JSON.stringify(json, null, 2);

      fs.writeFile(filename, jsonDone, 'utf8', () => {
        console.log('written');
      });
    }
    next();
  },
  function() {
    console.log('end');
  }

);
