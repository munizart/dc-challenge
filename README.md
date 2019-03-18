This is my submission to data collection challenge.

This README file will guide you through setting-up and running
both parts of the challenge.

Also, this file will provide a glimpse of the process in
developmenting it.

# Prerequisites
Before we start, we need a running redis server on default port (6379),
if you don't have one [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-redis)
will help you get it running.
If you not sure you have one, open a terminal and type this:
```sh
redis-cli
```

If redis is installed and running, you will see this output
```sh
127.0.0.1:6379>
```

We will also need node 10.15.x (current LTS) installed,
you can install it in multiple ways, I suggest using NVM.
DigitalOcean also have a [nice tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04#how-to-install-using-nvm)
on this.

# Getting started

Now we have everything we need, let's start.
Use npm to install node dependencies:
```bash
npm install
```
This may take few minutes, but it's all we need to get the project running.

# Part 1

The first challenge was to develop a server that denies further requests
with the **same body** in a 10 minutes time-window.

To do so, I've created a express server that receives post requests on
the path `/v1/products`.

The server is required to run on cluster, so to limit the requests to
once in ten minutes we can't rely neither on local memory nor IPC
(as nodes may not be on the same machine).
To achieve a global-memory I relied on a redis server.

To configure the redis host, port and url the server will look for the
environment variables REDIS_HOST, REDIS_PORT and REDIS_URL, although it
has smart default to running locally.

To limit request within the same checksum hash I used
[`rate-limiter-flexible`](https://github.com/animir/node-rate-limiter-flexible),
a actively maintained, well-documented, module for rate limiting.
A request is identified by a [checksum](part-1/src/check-sum.js)
of it's content.
Note that different JSON representation of the same object
will have different `checksum`s. It's on purpose,
as the challenge states that only request with the same body content should be denied.

Putting those pieces together I developed a [simple middleware](part-1/src/check-sum.js)
that computes request's checksum and then query the redis server
to certify the rate limit.

For testing, I chose `jest` as it is very well documented
and requires minimal configuration.

To run tests for the first challenge use:
```
npm run test:part-1
```
That will trigger tests for `limiter` and `check-sum`.

For testing the clusted behaviour you can launch to instance of the server
```
PORT=3001 node part-1/src/index.js &
PORT=3002 node part-1/src/index.js &
```

Then run:
```sh
curl -XPOST http://localhost:3001/v1/products -d '[{"id": "123", "name": "mesa"}]' #=> 200 OK
sleep 599 # wait 09:59
curl -XPOST http://localhost:3002/v1/products -d '[{"id": "123", "name": "mesa"}]' #=> 403 Forbidden
sleep 1 # wait another second
curl -XPOST http://localhost:3002/v1/products -d '[{"id": "123", "name": "mesa"}]' #=> 200 OK
```

# Part 2
The second challenge was to develop a script that parses a input file,
find at most three 200-returning image links for each product and dump
all products, line-by-line on a new format.

Analyzing the dataset, I've found that some images repeat across products,
so requesting those images first will reduce the number of total requests.

First, to read the file I developed a small abstraction layer over `readline`,
so I can read files [line-by-line](lib/line-by-line/index.js).

Then, created a [Sequence](lib/sequence/sequence.js) data-structure, to help
dealing with filtering, mapping and aggregating sequential data (our lines, in this case).

For requesting I wrapped `axios` over a [memoization layer](part-2/src/get.js),
so it can act as a in-memory cache.

Last, but not least, at [index.js](part-2/src/index.js) I read the file,
parse all JSON lines into objects, aggregate those objects grouping by `productId`
and counting by `images`.

For each product I sort images descending by their count and request then in this order
till I got three images or all images for the product was requested and then
I dump a line representing the product.

To count how many request was made I used a custom [image server](url-aggregator-api.js)
that can be run with:
```sh
node url-aggregator-api.js
```

Using this server I got the whole dump ready in ~25s
(the ruby server takes longer to respond, so script time is impacted)
```sh
time node part-2/src/index.js
{"productId":"pid4270","images":[...]}
...
{"productId":"pid4150","images":[...]}
node part-2/src/index.js  17,79s user 6,11s system 92% cpu 25,761 total
```

`27382` requests was made to got `29596` images dumped out.

To run tests for the `line-by-line` and `Sequence` modules run:
```
npm run test:lib
```
To run tests for this part of challenge run:
```
npm run test:part-2
```

### Linting
I choose `standard` as code style, and to ensure that i'm using eslint and `npm run lint` for linting.
