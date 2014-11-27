nbshot
======

Screenshot service based on node-webshot.

Currently, this creates screenshots from [nbviewer](http://nbviewer.ipython.org) and posts them to a CDN.

```
docker run -p 8181:8181 \
           -e OS_USERNAME= \
           -e OS_PASSWORD= \
           -e OS_REGION_NAME= \
           -e CONTAINER= \
           jupyter/nbshot
```

### TODO

* [ ] Determine good heuristics for capturing a screenshot of a rendered notebook
* [X] Cleanly end "API" call while the image processing happens in background
* [X] Send images off to a CDN
