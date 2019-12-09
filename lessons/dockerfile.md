---
title: "The Dockerfile"
path: "/dockerfile"
order: 4
section: "Containers"
---

So far we've been focusing a lot on running containers and haven't much dug into building them. This is on purpose because most of benefit of containers for developers comes from the running of containers. If you learn one thing, it should be how to run them.

That said, let's learn to build our own containers. We'll again be using Docker for this though there are other ways to do this. Docker has a special file called a `Dockerfile` which allows you to outline how a container will be built. Each line in a Docker file is a new a directive of how to change your Docker container.

A _big key_ with Docker container is that they're supposed to be disposable. You should be able to create them and throw them away as many times as necessary. In other words: adopt a mindset of making everything short-lived. There are other, better tools for long-running, custom containers.

Let's make the most basic Dockerfile ever. Let's make a new folder, maybe on your desktop. Put a file in there called `Dockerfile` (no extension.) In your file, put this.

## The most basic Dockerfile-based Container

```dockerfile
FROM node:12-stretch

CMD ["node", "-e", "console.log(\"hi lol\")"]
```

The first thing on each line (`FROM` and `CMD` in this case) are called _instructions_. They don't technically have to be all caps but it's convention to do so so that the file is easier to read. Each one of these instruction incrementally changes the container from the state it was in previously, adding what we call a _layer_.

Let's go ahead and build our container. Run (from inside of the directory of where your Dockerfile is)

```bash
docker build .
```

You should see it out put a bunch of stuff and it'll leave you with the hash of an image. After each instruction, you'll see a hash similar to the ones we've been using for the IDs for the containers. You know why that is? It's because each one of those layers is in-and-of themselves a valid container image! This ends up being important later and we'll discuss it in a bit.

Our container has two instructions in its Dockerfile, but actually it has many, many more. How? The first instruction, `FROM node:12-stretch` actually means _start_ with the `node` container. That container itself [comes from another Dockerfile][docker-node] which build its own container, which itself [comes from another Dockerfile][buildpack], which comes ultimately from the [Debian][debian] image.

This is something very powerful about Docker: you can use images to build other images and build on the work of others. Instead of having to worry about how to install Debian and all the necessary items to build Node.js from its source, we can just start with a well-put-together image from the community.

Okay, so we start with `node:12-stretch` and then we add the `CMD` instruction. There will only ever be one of these in effect in a Dockerfile. If you have multiple it'll just take the last one. This is what you want Docker to do when someone runs the container. In our case, we're running `node -e "console.log('hi lol')"` from within the container. `node -e`, if you don't know, will run whatever is inside of the quotes with Node.js. In this case, we're logging out `hi lol` to the console.

You _can_ put `CMD node -e "console.log('hi lol')"` as that last line and it'll work but it's not the preferred way of doing it. This won't actually go through bash which itself is simpler and usually safer. I do it this way because the docs strongly encourage you to do it this way.

So, in essence, our containers nabs a `node:12-stretch` container and then when we have it execute a `node` command when you run it. Let's try it. Grab the hash from your build and run

```bash
docker run <ID>
```

It's a little inconvenient to always have to refer to it by ID, it'd be easier if it had a name. So let's do that! Try

```bash
docker build . --tag my-node-app ## or -t instead of --tag
docker run my-node-app
```

Much easier to remember the name rather than a hash. If you want to version it yourself, you can totally do this:

```bash
docker build -t my-node-app:1 .
docker run my-node-app:1
```

Now change your `Dockerfile` so that it logs out `wat` instead of `hi lol`. After you do that.

```bash
docker build -t my-node-app:2 .
docker run my-node-app:2
docker run my-node-app:1
```

You can version your containers and hold on to older ones, just in case!

## Building a Node.js App with Docker

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
FROM node:12-stretch

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

Try stopping your server now. Your normal CTRL+C won't work. Node.js itself doesn't handle SIGINT (which is what CTRL+C is) in and of itself. Instead you either have to handle it yourself inside of your Node.js code (preferable for real apps) or you can tell Docker to handle it with the `--init` flag. This uses a package called [tini][tini] to handle shutdown signal for you.

```bash
docker run --init --publish 3000:3000 my-node-app # or you can use -p instead of --publish
```

The `publish` part allows you to forward a port out of a container to the host computer. In this case we're forwarding the port of `3000` (which is what the Node.js server was listening on) to port `3000` on the host machine. The `3000` represents the port on the host machine and the second `3000` represents what port is being used in the container. If you did `docker run --publish 8000:3000 my-node-app`, you'd open `localhost:8000` to see the server (running on port `3000` inside the container).

Next, let's organize ourselves a bit better. Right now we're putting our app into the root directory of our container and running it as the root user. This both messy and unsafe. If there's an exploit for Node.js that get released, it means that whoever uses that exploit on our Node.js server will doing so as root which means they can do whatever they want. Ungood. So let's fix that. We'll put the directory inside our home directory under a different users.

```dockerfile
FROM node:12-stretch

USER node

COPY index.js /home/node/code/index.js

CMD ["node", "/home/node/code/index.js"]
```

The `USER` instruction let's us switch from being the root user to a different user, one called "node" which the `node:12-stretch` image has already made for us. We could make our own user too using bash commands but let's just use the one the node image gave us. (More or less you'd run `RUN useradd -ms /bin/bash lolcat` to add a lolcat user.)

Notice we're now copying inside of the user's home directory. This is because they'll have proper permissions to interact with those files whereas they may not if we were outside of their home directory. You'll save yourself a lot of permission wrangling if you put it in a home directory. But we'll have to add a flag to the `COPY` command to make sure the user owns those files. We'll do that with `--chown=node:node` where the first `node` is the user and the second `node` is the user group.

It's no big deall that the "code" directory doesn't exist, `COPY` will create it.

Great. Let's make everything a bit more succint by setting a working directory

```dockerfile
FROM node:12-stretch

USER node

WORKDIR /home/node/code

COPY --chown=node:node index.js .

CMD ["node", "index.js"]
```

`WORKDIR` works as if you had `cd`'d into that directory, so now all paths are relative to that. And again, if it doesn't exist, it will create it for you.

Now we just tell `COPY` to copy the file into the same directory. Now we're giving it a directory instead of a file name, it'll just assume we want the same name. You could rename it here if you wanted.

## A more complicated app

Okay, all looking good so far. Let's make this app go one step further. Let's have it have an npm install step! In the directory where your app is, put this:

```javascript
// more-or-less the example code from the hapi-pino repo
const hapi = require("@hapi/hapi");

async function start() {
  const server = hapi.server({
    host: "0.0.0.0",
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
FROM node:12-stretch

USER node

WORKDIR /home/node/code

COPY --chown=node:node . .

RUN npm ci

CMD ["node", "index.js"]
```

We changed the `COPY` to copy everything in the directory. Right now you probably a `node_modules` but if you're building a container directly from a repo it won't copy the `node_modules` so we have to operate under the assumption that those won't be there. Feel free even to delete them if you want.

Let's go ahead and add a `.dockerignore` file to the root of the project that prevents Docker from copying the `node_modules`. This has the same format as a `.gitignore`.

```
node_modules/
.git/
```

We then added a `RUN` instruction to run a command inside of the container. If you're not familiar with `npm ci` it's very similar to `npm install` with a few key differences: it'll follow the `package-lock.json` exactly (where `npm install` will ignore it and update it if newer patch versions of your dependencies are available) and it'll automatically delete `node_modules` if it exists. `npm ci` is made for situations like this.

Now if you try to build again, it'll fail with permissions issues. Why? Well, when you have `WORKDIR` create a directory, it does so as root which means that the node user won't have enough permissions to modify that directory. We could either use `RUN` to change the user or we could use `RUN` to make the directory in the first place as node. Let's do the latter.

```dockerfile
FROM node:12-stretch

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node . .

RUN npm ci

CMD ["node", "index.js"]
```

Now try building and running your container. It should work now! Yay!

**NOTE:** make sure you don't bind your app to host `localhost` (like if you put `localhost` instead of `0.0.0.0` in the host in our hapi app.) This will make it so the app is only available _inside_ the container. If you see `connection reset` instead of when you're expecting a response, this a good candidate for what's happening (because this definitely didn't _just_ happen to me 😂.)

## A Note on EXPOSE

This was a point of confusion for me so I'm going to try to clear it up for you. There is an instruction called `EXPOSE <port number>` that its intended use is to expose ports from within the container to the host machine. However if we don't do the `-p 3000:3000` it still isn't exposed so in reality this instruction doesn't do much. You don't need `EXPOSE`.

There are two caveats to that. The first is that it could be useful documentation to say that "I know this Node.js service listens on port 3000 and now anyone who reads this Docekrfile will know that too." I would challenge this that I don't think the Dockerfile is the best place for that documentation

The second caveat is that instead of `-p 3000:3000` you can do `-P`. This will take all of the ports you exposed using `EXPOSE` and will map them to random ports on the host. You can see what ports it chose by using `docker ps`. It'll say something like `0.0.0.0:32769->3000/tcp` so you can see in this case it chose `32769`. Again, I'd prefer to be deliberate about which ports are being mapped.

## Layers

Go make any change to your Node.js app. Now re-run your build process. Docker is smart enough to see the your `FROM`, `RUN`, and `WORKDIR` instructions haven't changed and wouldn't change if you ran them again so it uses the same containers it cached from the previous but it can see that your `COPY` is different since files changed between last time and this time, so it begins the build process there and re-runs all instructinos after that. Pretty smart, right?

So which part of container-building takes the longest? `RUN npm ci`. Anything that has to hit the network is going to take the longest without-a-doubt. The shame is that our `package.json` hasn't changed since the previous iteration; we just changed something in our `index.js`. So how we make it so we only re-run our `npm ci` when package.json changes? Break it into two `COPY` instructions!

```Dockerfile
FROM node:12-stretch

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

The first `COPY` pulls just the `package.json` and the `package-lock.json` which is just enough to do the `npm ci`. After that we nab the rest of the files. Now if you make changes you avoid doing a full npm install. This is useful and recommended for any dependency installation: apt-get, pip, cargo, gems, etc. as well as any long-running command like building some from source.

[buildpack]: https://github.com/docker-library/buildpack-deps
[debian]: https://hub.docker.com/_/debian/
[node]: https://github.com/nodejs/docker-node/blob/master/Dockerfile-debian.template
[localhost]: http://localhost:3000
[tini]: https://github.com/krallin/tini
