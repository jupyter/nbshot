FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install phantomjs nodejs npm -y

RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

ADD . /srv/webslinger/
WORKDIR /srv/webslinger
RUN npm install

CMD ["node", "index.js"]
