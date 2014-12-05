var express = require('express');
var bodyParser = require('body-parser');
var webshot = require('webshot');
var pkgcloud = require('pkgcloud');
var url = require('url');

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

  var width = req.params.width || defaultWidth;
  var height = req.params.height || defaultHeight;

  var upstream_uri = req.params.upstream_uri;

  console.log(baseURL);
  console.log(upstream_uri);
  console.log(req.path);
  console.log("wat");

  var upstreamURL = url.resolve(baseURL, upstream_uri);

  var object_path = width + "/" + height + "/" + upstream_uri;

  console.log("Rendering " + upstreamURL);
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
  
  webshot(upstreamURL, options, function(err, renderStream) {

    if (err !== undefined) {
			 console.log(err);
       // TODO: Set an appropriate status
			 //res.send(err);
			 return;
		}

    var fullPath = width + height + path + ".png"

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

var app = express();

//app.use(bodyParser.json());

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

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});


app.param('width', /^\d+$/);
app.param('height', /^\d+$/);
app.param('upstream_uri', /^.+$/);

app.get('/api/screenshots/:width/:height/:upstream_uri', screenshot);
app.post('/api/screenshots/:width/:height/:upstream_uri', screenshot);

app.get('/', function(req, res) {
  res.json({
    "screenshots_url": req.headers.host + "/api/screenshots/{width}/{height}/{upstream_uri}",
    "base_url": baseURL
	});
});

var server = app.listen(8181, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('nbshot listening at http://%s:%s', host, port)
});
