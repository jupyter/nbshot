var restify = require('restify');
var webshot = require('webshot');

var baseURL = process.env.BASE_URL || 'http://nbviewer.ipython.org';
var zoomFactor = process.env.ZOOM_FACTOR || 0.5;

function twitterCard(req, res, next) {
  path = req.path();
  console.log(path);
  res.setHeader('content-type', 'image/png');
  var options = {
    screenSize: {
      width: 280
    , height: 150
    }
  , shotSize: {
      width: 280
    , height: 150
    }
  , zoomFactor: zoomFactor
  }
  
  webshot(baseURL + path, options, function(err, renderStream) {
    renderStream.pipe(res);
  });
}

var server = restify.createServer();
server.get('/.*', twitterCard);

server.listen(8181, function() {
  console.log('%s listening at %s', server.name, server.url);
});
