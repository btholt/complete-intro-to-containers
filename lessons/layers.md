---
title: "Layers"
path: "/layers"
order: 4.5
section: "The Dockerfile"
---

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
