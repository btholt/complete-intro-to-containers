---
title: "Making Our Own Alpine Node.js Container"
path: "/making-our-own-alpine-nodejs-container"
order: 5.1
section: "Making Tiny Containers"
---

## Making our own Node.js Alpine container

Let's take this exercise a bit further. Let's actually make our own Node.js Alpine container. NOTE: I'd suggest always using the official one. They'll keep it up to date with security fixes and they're _real_ good at making containers. Better than I am, anyway. But this is a good exercise for us to go through to learn how to install system dependencies.

Start with this in a new Dockerfile. You can call it `my-node.Dockerfile`. Some people will insist it should be `Dockerfile.my-node` but the former doesn't break syntax highlighting and it doesn't matter since Docker doesn't actually care.

```dockerfile
FROM alpine:3.10

RUN apk add --update nodejs npm
```

`alpine:latest` would nab you the latest Alpine (3.10 as of writing, if you run into issues with versions, continue with `alpine:3.10` instead of `alpine:latest`. Otherwise feel free to truck on with `alpine:latest`)

`RUN apk add --update nodejs npm` will use the Alpine package manager to grab Node.js and npm (they're bundled separately for Alpine.)

Okay so now if you do `docker build -t my-node -f my-node.Dockerfile .` it'll build your new image. `-t` is `--tag` and `-f` is `--file` which is what tells Docker is the name of your Dockerfile you're using (otherwise it assumes you're using a file called exactly `Dockerfile`.) Now try `docker run -it my-node`. In here you should have a pretty bare bones Linux container but both `node -v` and `npm -v` should work.

Keep in mind that Alpine does not use bash for its shell; it uses a different shell called `ash` or often just `sh`. It's similar enough to bash but there are some differences. It's not really the point of this class so we'll keep the focus on learning just what's necessary.

Let's next make our `node` user.

```dockerfile
FROM alpine:3.10

RUN apk add --update nodejs npm

RUN addgroup -S node && adduser -S node -G node

USER node
```

I'm mimicking what the Node.js official container does, which is make a user group of `node` with one user in it, `node`. Feel free to name them different things if you feel so inclined. Notice we could conceivably combine the two `RUN` instructions together but it's generally best practices to keep "ideas" separate. The first `RUN` installs dependencies, the second one creates the `node` user. Up to you how you do it, neither is wrong per se.

Now we can just copy the rest from the previous Dockerfile! Let's do that.

```dockerfile
FROM alpine:3.10

RUN apk add --update nodejs npm

RUN addgroup -S node && adduser -S node -G node

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

It works! We're down to 56MB (compared to 86MB with the official `node:alpine` container). Honestly, I'm not entirely sure what we cut out from the other `node:alpine` container but it's probably important. Again, I'd stick to the official containers where they exist. But hey, we learned how to add a user and install system dependencies! Let's make it even small because why the hell not.
