var webshot = require('webshot');

var options = {
  screenSize: {
    width: 320
  , height: 480
  }
, shotSize: {
    width: 320
  , height: 'all'
  }
, userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
    + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
, phantomPath: 'node_modules/phantomjs/bin/phantomjs'
}

webshot('https://nbviewer.ipython.org', 'nbviewer.jupyter.org.png', options, function(err) {
  if (err) {
    console.log("This erred");
    console.log(err);
  }
});
