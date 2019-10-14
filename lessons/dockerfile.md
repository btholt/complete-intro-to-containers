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

Okay, so we start with `node:latest` and then we add the `CMD` instruction. There will only ever be one of these in effect in a Dockerfile. If you have multiple it'll just take the last one. This is what you want Docker to do when someone runs the container. In our case, we're running `node -e "console.log('hi lol')"` from within the container. `node -e`, if you don't know, will run whatever is inside of the quotes with Node.js. In this case, we're logging out `hi lol` to the console.

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

```bash
docker build -t my-node-app .
docker run my-node-app
```

Now your Node.js app is running inside of a container managed by Docker! Hooray! But one problem, how do we access it? If you open [locahlost:3000][localhost] now, it doesn't work! We have to tell Docker to expose the port. So let's do that now. Stop your container from running and run it again like this.

```bash
docker run --publish 3000:3000 my-node-app # or you can use -p instead of --publish
```

The `publish` part allows you to forward a port out of a container to the host computer. In this case we're forwarding the port of `3000` (which is what the Node.js server was listening on) to port `3000` on the host machine. The `3000` represents the port on the host machine and the second `3000` represents what port is being used in the container. If you did `docker run --publish 8000:3000 my-node-app`, you'd open `localhost:8000` to see the server (running on port `3000` inside the container).

Next, let's organize ourselves a bit better. Right now we're putting our app into the root directory of our container and running it as the root user. This both messy and unsafe. If there's an exploit for Node.js that get released, it means that whoever uses that exploit on our Node.js server will doing so as root which means they can do whatever they want. Ungood. So let's fix that. We'll put the directory inside our home directory under a different users.

```dockerfile
FROM node:latest

USER node

COPY index.js /home/node/code/index.js

CMD ["node", "/home/node/code/index.js"]
```

The `USER` instruction let's us switch from being the root user to a different user, one called "node" which the `node:latest` image has already made for us. We could make our own user too using bash commands but let's just use the one the node image gave us. (More or less you'd run `RUN useradd -ms /bin/bash lolcat` to add a lolcat user.)

Notice we're now copying inside of the user's home directory. This is because they'll have proper permissions to interact with those files whereas they may not if we were outside of their home directory. You'll save yourself a lot of permission wrangling if you put it in a home directory.

It's no big deall that the "code" directory doesn't exist, `COPY` will create it.

Great. Let's make everything a bit more succint by setting a working directory

```dockerfile
FROM node:latest

USER node

WORKDIR /home/node/code

COPY index.js .

CMD ["node", "index.js"]
```

`WORKDIR` works as if you had `cd`'d into that directory, so now all paths are relative to that. And again, if it doesn't exist, it will create it for you.

Now we just tell `COPY` to copy the file into the same directory. Now we're giving it a directory instead of a file name, it'll just assume we want the same name. You could rename it here if you wanted.

## A more complicated app

Okay, all looking good so far. Let's make this app go one step further. Let's have it have an npm install step! In the directory where your app is, put this:

```javascript
const hapi = require("@hapi/hapi");

async function start() {
  const server = hapi.server({
    host: "localhost",
    port: process.env.PORT || 3000
  });

  server.route({
    method: "GET",
    path: "/",
    handler() {
      return { success: true };
    }
  });

  await server.register({
    plugin: require("hapi-pino"),
    options: {
      prettyPrint: true
    }
  });

  await server.start();

  return server;
}

start().catch(err => {
  console.log(err);
  process.exit(1);
});
```

This is a [hapi.js][hapi] server. Hapi is a server-side framework (like Express) for Node.js and my personal favorite. This is going to require that we `npm install` the dependencies. So in your project do the following

```bash
npm init -y # this will create a package.json for you without asking any questions
npm install @hapi/hapi hapi-pino
```

Now try running `node index.js` to run the Node.js server. You should see it running and logging out info whenever you hit an endpoint. Cool, so now that we have a full featured Node.js app, let's containerize it.

If we tried to build it and run it right now it'd fail because we didn't `npm install` the dependencies. So now right after the `COPY` we'll add a `RUN`.

```dockerfile
FROM node:latest

USER node

WORKDIR /home/node/code

COPY . .

RUN npm ci

CMD ["node", "index.js"]
```

We changed the `COPY` to copy everything in the directory. Right now you probably a `node_modules` but if you're building a container directly from a repo it won't copy the `node_modules` so we have to operate under the assumption that those won't be there. Feel free even to delete them if you want.

We then added a `RUN` instruction to run a command inside of the container. If you're not familiar with `npm ci` it's very similar to `npm install` with a few key differences: it'll follow the `package-lock.json` exactly (where `npm install` will ignore it and update it if newer patch versions of your dependencies are available) and it'll automatically delete `node_modules` if it exists. `npm ci` is made for situations like this.

Now if you try to build again, it'll fail with permissions issues. Why? Well, when you have `WORKDIR` create a directory, it does so as root which means that the node user won't have enough permissions to modify that directory. We could either use `RUN` to change the user or we could use `RUN` to make the directory in the first place as node. Let's do the latter.

```dockerfile
FROM node:latest

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY . .

RUN npm ci

CMD ["node", "index.js"]
```

Now try building and running your container. It should work now! Yay!

## TODO

- Expose port, actually open the page in the browser
- Put the app in a better spot
- Add in package.json, npm install
- Layers
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
