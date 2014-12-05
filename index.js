var url = require('url');

var express = require('express');
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
var defaultWidth = twitterCardWidth = 280;
var defaultHeight = twitterCardHeight = 150;

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

  var width = req.params.width || defaultWidth;
  var height = req.params.height || defaultHeight;

  var capture_uri = req.params.capture_uri;
  var captureURL = url.resolve(baseURL, capture_uri);

  var CDNPath = width + "/" + height + "/" + capture_uri + ".png";

  console.log("Rendering " + captureURL);
  console.log("At " + width + "x" + height);

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
  
  webshot(captureURL, options, function(err, renderStream) {

    var writeStream = client.upload({
      container: containerName,
      remote: decodeURI(CDNPath)
    });

    writeStream.on('error', function(err) {
      console.log(err);
    });

    writeStream.on('success', function(file) {
      console.log('Finished ' + CDNPath);
    });

	  renderStream.pipe(writeStream);
    
    res.send({url: url.resolve(req.cdnUrl, CDNPath)});
  });
}

var app = express();

app.use(function(req, res, next) {
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

app.get('/api/screenshots/:width/:height/:capture_uri(*)', screenshot);

// Utility redirect for Twitter cards
app.get('/api/twitter_cards/:capture_uri(*)', function(req, res) {
  res.redirect('/api/screenshots/' + twitterCardWidth +
                               '/' + twitterCardHeight +
															 '/' + req.params.capture_uri);
});

app.get('/', function(req, res) {
  res.json({
    "screenshots_url": req.headers.host + "/api/screenshots/{width}/{height}/{capture_uri}",
    "base_url": baseURL
	});
});

var server = app.listen(8181, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('nbshot listening at http://%s:%s', host, port)
});
