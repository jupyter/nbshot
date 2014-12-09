nbshot
======

Notebook viewer screenshot service based on node-webshot.

Currently, this creates screenshots from [nbviewer](http://nbviewer.ipython.org) and posts them to a CDN.

```
docker run -p 8181:8181 \
           -e OS_USERNAME= \
           -e OS_PASSWORD= \
           -e OS_REGION_NAME= \
           -e CONTAINER= \
           jupyter/nbshot
```

Note that this is largely provisional in API use and is only intended as a service for nbviewer itself to use.
