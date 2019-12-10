---
title: "Alpine Linux"
path: "/alpine-linux"
order: 5.0
section: "Making Tiny Containers"
---

We've now built a nice little container for our Node.js app and we absolutely could ship it as-is to production. However there's a few things we can do to make things even faster, cheaper, and more secure.

## Making your containers smaller

Making your containers smaller is a good thing for a few reasons. For one, everything tends to get a bit cheaper. Moving containers across the Internet takes time and bits to do. If you can make those containers smaller, things will go faster and you'll require less space on your servers. Often private container registries (like personal Docker Hubs, Azure Container Registry is a good example) charge you by how much storage you're using.

Beyond that, having less _things_ in your container means you're less susceptible to bugs. Let's say there's a Python exploit that's going around that allows hackers to get root access to your container. If you don't have Python in your container, you're not vulnerable! And obviously if you do have Python installed (even if you're not using it) you're vulnerable. So let's see how to make your container a bit smaller.

In your previous Dockerfile, change the first line (`FROM`)

```dockerfile
FROM node:alpine

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

Our image size (by comparing the `"Size"` field in in `docker inspect my-app`) from 913MB to 86MB just like that. We shed quite a bit of cruft that we didn't need in Ubuntu and we didn't even need to change anything in our Dockerfile. Honestly, that's unusual. When you strip _everything_ out typically you'll have to go back and add some of them back in. But in this case we're golden!

Alpine, if you remember, is a bare bones alternative to Ubuntu. It's built on Busybox Linux which is a 2MB distro of Linux (Alpine is 5MB.) `node:alpine` itself is about `80MB` and `node:latest is about 908MB`.

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

## Multi stage builds

Hey, we're already half-way to ridiculous, let's make our image EVEN SMALLER. Technically we only need `npm` to build our app, right? We don't actually need it to run our app. Docker allows you to have what it called multistage builds, we it uses one container to build your app and another to run it. This can be useful if you have big dependencies to build your app but you don't need those dependencies to actually run the app. A C++ or Rust app might be a good example of that: they need big tool chains to compile the apps but the resulting binaries are smaller and don't need those tools to actually run them. Or one perhaps more applicable to you is that you don't need the TypeScript or Sass compiler in production, just the compiled files. We'll actually do that here in a sec, but let's start here with eliminating `npm`.

Make a new Dockerfile, call it `multi-node.Dockerfile`.

```dockerfile
# build stage
FROM node:latest
WORKDIR /build
COPY package-lock.json package.json ./
RUN npm ci
COPY . .

# runtime stage
FROM alpine:3.10
RUN apk add --update nodejs
RUN addgroup -S node && adduser -S node -G node
USER node
RUN mkdir /home/node/code
WORKDIR /home/node/code
COPY --from=0 --chown=node:node /build .
CMD ["node", "index.js"]
```

Notice we have have two `FROM` instructions. This is how you can tell it's multistage. The last container made will be the final one that gets labeled and shipped. Notice we're starting in Ubuntu which one we use since we're not going to ship this container so we can use the kitchen sink to build it before it copying it to a smaller container.

After building everything in the build stage (you can have more than two stages by the way) we move on to the runtime container. In this one we're using Alpine due its size and security benefits. Everything else looks similar to what we were doing before, just now we're going to be copying from the build container instead of the host machine.

The two real key differences are that we don't `apk add npm` and we're doing `COPY --from=0` which means we're copying from the first stage. As you may imagine, this means you can copy from any previous stage or if you leave `--from` off it'll come from the host machine.

So try it now!

```bash
docker build -t multi-node -f multi-node.Dockerfile .
docker run -p 3000:3000 multi-node
```

Still works! And our container size is down to a cool 39MB as compared to 56MB when we included npm, 86MB when we used `node:alpine` and 913MB when we used `node:latest`.

Pretty amazing, right? Honestly, how worth is it doing micro optimization like this? Not very. We had to do a decent amount to shave 40MB off the final size and now we're stuck maintaining it. I'd rather just start with `FROM node:alpine` and call it a day. We get all their wisdom for free and we're not stuck with a longer Dockerfile than we need. But it is definitely worth going from 913MB to 86MB!
