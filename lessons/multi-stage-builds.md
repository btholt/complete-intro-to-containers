---
title: "Multi Stage Builds"
path: "/multi-stage-builds"
order: 5.2
section: "Making Tiny Containers"
description: "Multi stage builds can help you make your containers even smaller and more secure by leaving out tools only needed to build the container. Brian shows how to make the Alpine-Node.js container built in previous sections even smaller using this technique."
---

Hey, we're already half-way to ridiculous, let's make our image EVEN SMALLER. Technically we only need `npm` to build our app, right? We don't actually need it to run our app. Docker allows you to have what it called multistage builds, we it uses one container to build your app and another to run it. This can be useful if you have big dependencies to build your app but you don't need those dependencies to actually run the app. A C++ or Rust app might be a good example of that: they need big tool chains to compile the apps but the resulting binaries are smaller and don't need those tools to actually run them. Or one perhaps more applicable to you is that you don't need the TypeScript or Sass compiler in production, just the compiled files. We'll actually do that here in a sec, but let's start here with eliminating `npm`.

Make a new Dockerfile, call it `multi-node.Dockerfile`.

```dockerfile
# build stage
FROM node:12-stretch
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

Still works! And our container size is down to a cool 39MB as compared to 56MB when we included npm, 86MB when we used `node:12-alpine` and 913MB when we used `node:latest`.

Pretty amazing, right? Honestly, how worth is it doing micro optimization like this? Not very. We had to do a decent amount to shave 40MB off the final size and now we're stuck maintaining it. I'd rather just start with `FROM node:12-alpine` and call it a day. We get all their wisdom for free and we're not stuck with a longer Dockerfile than we need. But it is definitely worth going from 913MB to 86MB!
