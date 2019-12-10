---
title: "Build a Node.js App"
path: "/build-a-nodejs-app"
order: 4.1
section: "The Dockerfile"
---

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

It's no big deal that the "code" directory doesn't exist, `COPY` will create it.

### A Quick Note on COPY vs ADD

The two commands `COPY` and `ADD` do very similar things with a few key differences. `ADD` can also accept, in addition to local files, URLs to download things off the Internet and it will also automatically unzip any tar files it downloads or adds. `COPY` will just copy local files. Use `COPY` unless you need to unzip something or are downloading something.

---

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

[localhost]: http://localhost:3000
[tini]: https://github.com/krallin/tini
