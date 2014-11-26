var webshot = require('webshot');
var fs      = require('fs');

webshot('nbviewer.ipython.org', function(err, renderStream) {
  var file = fs.createWriteStream('nbviewer.ipython.org.png', {encoding: 'binary'});
  renderStream.on('data', function(data) {
    file.write(data.toString('binary'), 'binary');
  });
});

