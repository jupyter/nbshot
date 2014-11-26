var restify = require('restify');
var webshot = require('webshot');
var pkgcloud = require('pkgcloud');

var cdnSslUri = '';

var baseURL = process.env.BASE_URL || 'http://nbviewer.ipython.org';
var zoomFactor = process.env.ZOOM_FACTOR || 0.5;

var client = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: process.env.OS_USERNAME,
  apiKey:   process.env.OS_PASSWORD,
  region:   process.env.OS_REGION_NAME
});

var containerName = process.env.CONTAINER;

function twitterCard(req, res, next) {
  path = req.path();
  console.log(path);
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
    var writeStream = client.upload({
      container: containerName,
      remote: path + ".png"
    });

    writeStream.on('error', function(err) {
      console.log(err);
    });

    writeStream.on('success', function(file) {
      res.send({url: cdnSslUri + path});
    });

    renderStream.pipe(writeStream);
  });
}

client.getContainer(containerName, function(err, container) {
  //TODO: Have this available and ready for later
  cdnSslUri = container.cdnSslUri;

  var server = restify.createServer();
  server.get('/.*', twitterCard);
  
  server.listen(8181, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
});


