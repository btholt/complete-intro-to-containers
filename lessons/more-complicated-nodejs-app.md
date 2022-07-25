---
title: "A More Complicated Node.js App"
path: "/more-complicated-nodejs-app"
order: 4.2
section: "The Dockerfile"
description: "Brian shows how to write a Dockerfile for a more complicated app and how to avoid problems with Node.js native modules"
---

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
npm install @hapi/hapi@18.4.0 hapi-pino@6.3.0
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
