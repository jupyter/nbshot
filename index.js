var restify = require('restify');
var webshot = require('webshot');
var pkgcloud = require('pkgcloud');

/**
 * CDN URL will get defined later in the process after asking CloudFiles
 */
var cdnUrl = '';

/**
 * Base URL is the URL to render screenshots from
 */
var baseURL = process.env.BASE_URL || 'http://nbviewer.ipython.org';

var zoomFactor = process.env.ZOOM_FACTOR || 0.5;
var renderDelay = process.env.RENDER_DELAY || 100;
var width = 280;
var height = 150;

var client = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: process.env.OS_USERNAME,
  apiKey:   process.env.OS_PASSWORD,
  region:   process.env.OS_REGION_NAME
});

var containerName = process.env.CONTAINER;

function detectInteresting() {
	$('#menubar').remove();
  // YOLO, get the last image
  img = $('img').last();
  el = img[0];
  // TODO: Actually get the screenshot setup where this image is.
  //
  //       Scrolling does nothing since we have to set shot and screen size prior,
  //       and the "screen" is full size (Phantom pretty much ignores this).
  el.scrollIntoView()
}

function screenshot(req, res, next) {
  var path = req.path();
  console.log("Rendering " + path);
  var options = {
    screenSize: {
      width: width
    , height: height
    }
  , shotSize: {
      width: width
    , height: height
    }
  , zoomFactor: zoomFactor
  , renderDelay: renderDelay
  , onLoadFinished: detectInteresting
  }
  
  webshot(baseURL + path, options, function(err, renderStream) {
    var fullPath = path + ".png"

    var writeStream = client.upload({
      container: containerName,
      remote: decodeURI(fullPath)
    });

    writeStream.on('error', function(err) {
      console.log(err);
    });

    writeStream.on('success', function(file) {
      console.log('Finished ' + fullPath);
    });

    renderStream.pipe(writeStream);
    res.send({url: req.cdnUrl + fullPath});
  });
}

var server = restify.createServer();

server.use(function(req, res, next) {
  // If we already have the url, just put it in the request, and then continue
  if (cdnUrl) {
    req.cdnUrl = cdnUrl;
    next();
    return;
  }

  // Note: there will be latency on the first request
  client.getContainer(containerName, function(err, container) {
    if (err) { next(err); return; }

    req.cdnUrl = cdnUrl = container.cdnSslUri;
    next();
    return;
  });
});

server.get('/api/screenshot/.*', screenshot);

server.listen(8181, function() {
  console.log('%s listening at %s', server.name, server.url);
});

