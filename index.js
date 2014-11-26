var restify = require('restify');

var webshot = require('webshot');

function twitterCard(req, res, next) {
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
	
	webshot('nbviewer.ipython.org', options, function(err, renderStream) {
    renderStream.pipe(res);
	});
}

var server = restify.createServer();
server.get('/test.png', twitterCard);

server.listen(8181, function() {
	console.log('%s listening at %s', server.name, server.url);
});
