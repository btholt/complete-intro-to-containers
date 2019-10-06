---
title: "The Dockerfile"
path: "/dockerfile"
order: 3
---

So far we've been focusing a lot on running containers and haven't much dug into building them. This is on purpose because most of benefit of containers for developers comes from the running of containers. If you learn one thing, it should be how to run them.

That said, let's learn to build our own containers. We'll again be using Docker for this though there are other ways to do this. Docker has a special file called a `Dockerfile` which allows you to outline how a container will be built. Each line in a Docker file is a new a directive of how to change your Docker container.

A _big key_ with Docker container is that they're supposed to be disposable. You should be able to create them and throw them away as many times as necessary. In other words: adopt a mindset of making everything short-lived. There are other, better tools for long-running, custom containers.

Let's make the most basic Dockerfile ever. Let's make a new folder, maybe on your desktop. Put a file in there called `Dockerfile` (no extension.) In your file, put this.

```dockerfile
FROM node:latest

CMD ["node", "-e", "console.log(\"hi lol\")"]
```

The first thing on each line (`FROM` and `CMD` in this case) are called _instructions_. They don't technically have to be all caps but it's convention to do so so that the file is easier to read. Each one of these instruction incrementally changes the container from the state it was in previously, adding what we call a _layer_.

Let's go ahead and build our container. Run (from inside of the directory of where your Dockerfile is)

```bash
docker build .
```

You should see it out put a bunch of stuff and it'll leave you with the hash of an image. After each instruction, you'll see a hash similar to the ones we've been using for the IDs for the containers. You know why that is? It's because each one of those layers is in-and-of themselves a valid container image! This ends up being important later and we'll discuss it in a bit.

Our container has two instructions in its Dockerfile, but actually it has many, many more. How? The first instruction, `FROM node:latest` actually means _start_ with the `node` container. That container itself [comes from another Dockerfile][docker-node] which build its own container, which itself [comes from another Dockerfile][buildpack], which comes ultimately from the [Debian][debian] image.

This is something very powerful about Docker: you can use images to build other images and build on the work of others. Instead of having to worry about how to install Debian and all the necessary items to build Node.js from its source, we can just start with a well-put-together image from the community.

Okay, so we start with `node:latest` and then we add the `CMD` instruction. There will only ever be one of these in effect in a Dockerfile. If you have multiple it'll just take the last one. This is what you want Docker to do when someone runs the container. In our case, we're running `node -e "console.log('hi lol')"` from within the container. `node -e`, if you don't know, will run whatever is inside of the parens with Node.js. In this case, we're logging out `hi lol` to the console.

You _can_ put `CMD node -e "console.log('hi lol')"` as that last line and it'll work but it's not the preferred way of doing it. This won't actually go through bash which itself is simpler and usually safer. I do it this way because the docs strongly encourage you to do it this way.

So, in essence, our containers nabs a `node:latest` container and then when we have it execute a `node` command when you run it. Let's try it. Grab the hash from your build and run

```bash
docker run <ID>
```

It's a little inconvenient to always have to refer to it by ID, it'd be easier if it had a name. So let's do that! Try

```bash
docker build . -t my-node-app
docker run my-node-app
```

Much easier to remember the name rather than a hash. You can see it added `:latest` for you. If you want to version it yourself, you can totally do this:

```bash
docker build . -t my-node-app:1
docker run my-node-app:1
```

Now change your `Dockerfile` so that it logs out `wat` instead of `hi lol`. After you do that.

```bash
docker build . -t my-node-app:2
docker run my-node-app:2
docker run my-node-app:1
```

You can version your containers and hold on to older ones, just in case!

So now let's dig into some more advance things you can do with a Dockerfile. Let's first make our project a real Node.js application. Make a file called `index.js` and put this in there.

```javascript
const http = require("http");

http
  .createServer(function(request, response) {
    console.log("request received");
    response.end("omg hi", "utf-8");
  })
  .listen(3000);
console.log("server started");
```

This more-or-less that most barebones Node.js app you can write. It just responds to HTTP traffic on port 3000. Go ahead and try running it on your local computer (outside of Docker) by running `node index.js`. Hit [localhost:3000][localhost] to give it a shot.

Okay, so let's get this running _inside_ Docker now. First thing is we have to copy this file from your local file system into the container. We'll use a new instruction, `COPY`. Modify your Dockerfile to say:

```dockerfile
FROM node:latest

COPY index.js index.js

CMD ["node", "index.js"]
```

This will copy your index.js file from your file system into the Docker file system (the first index.js is the source and the second index.js is the destination of that file inside the container.)

We then modified the `CMD` to start the server when we finally do run the container. Now run

```dockerfile
docker build . -t my-node-app
docker run my-node-app
```

Now your Node.js app is running inside of Docker! Hooray!

## TODO

- Expose port, actually open the page in the browser
- Add in package.json, npm install
- Show incremental rebuilds by splitting out package.json copy and install
- Demonstrate `RUN`
  - `ENV`
  - `ARG`
  - `ENTRYPOINT`?
  - `USER`
  - `WORKDIR`
- Build our own Node.js image

[buildpack]: https://github.com/docker-library/buildpack-deps
[debian]: https://hub.docker.com/_/debian/
[node]: https://github.com/nodejs/docker-node/blob/master/Dockerfile-debian.template
[localhost]: http://localhost:3000
