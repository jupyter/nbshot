var restify = require('restify');
var webshot = require('webshot');

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
  , zoomFactor: 0.5
  }
  
  webshot('http://nbviewer.ipython.org' + path, options, function(err, renderStream) {
    renderStream.pipe(res);
  });
}

var server = restify.createServer();
server.get('/.*', twitterCard);

server.listen(8181, function() {
  console.log('%s listening at %s', server.name, server.url);
});
