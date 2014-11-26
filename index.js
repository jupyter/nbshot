var restify = require('restify');
var webshot = require('webshot');
var pkgcloud = require('pkgcloud');

var cdnUrl = '';

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
    });

    renderStream.pipe(writeStream);
    res.send({url: req.cdnUrl + path + ".png"});
  });
}

var server = restify.createServer();

server.use(function(req, res, next) {
  // if we already have the url, just put it in the request, and then continue
  if (cdnUrl) {
    req.cdnUrl = cdnUrl;
    next();
    return;
  }

  // note, this would create a latency for the first request
  client.getContainer(containerName, function(err, container) {
    if (err) { next(err); return; }

    req.cdnUrl = cdnUrl = container.cdnSslUri;
    next();
    return;
  });
});

server.get('/.*', twitterCard);

server.listen(8181, function() {
  console.log('%s listening at %s', server.name, server.url);
});

