---
title: "Networking with Docker"
order: 6.4
path: "/networking"
section: "Features in Docker"
description: "Networking is key when you start making projects have multiple containers. Docker allows you to create bridge networks to connect connect containers together. Brian shows how to connect two MongoDB containers together so you can have one container running a database and one running the client to connect to the other."
---

This is not going to be a deep dive into how networking works. Networking is a deep, deep pool of knowledge and merits entire courses to understand. Just worrying about networking is some people's jobs due to the immense surface area of the subject. Instead, I want to just peek under the covers of how to do manual networking with Docker so you can understand what Docker Compose and Kubernetes do for you.

So why do we care about networking? Many reasons! Let's make our Node.js app a bit more complicated. What if it had a database? Let's connect it to a running MongoDB database. We _could_ start this MongoDB database inside of the same container and this might be fine for development on the smallest app but it'd be better and easier if we could just the [mongo][mongo] container directly. But if I have two containers running at the same time (the app containers and the MongoDB container) how do they talk to each other? Networking!

There are several ways of doing networking within Docker and all of them work differently depending which operating system you're on. Again, this is a deep subject and we're just going to skim the surface. We're going to deal with the simplest, the bridge networks. There is a default bridge network running all the time. If you want to check this out, run `docker network ls`. You'll see something like this:

```bash
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
xxxxxxxxxxxx        bridge              bridge              local
xxxxxxxxxxxx        host                host                local
xxxxxxxxxxxx        none                null                local
```

The bridge network is the one that exists all the time and we could attach to it if we want to, but again Docker recommends against it so we'll create our own. There's also the host network which is the host computer itself's network. The last network with the `null` driver is one that you'd use if you wanted to use some other provider or if you wanted to do it manually yourself.

Go ahead and run `docker network create --driver=bridge app-net`

Once you've done that, let's start a MongoDB server. Run `docker run -d --network=app-net -p 27017:27017 --name=db --rm mongo:3`. I'm having you run a specific version of MongoDB, v3, because I know the package to interact with it is already available on Ubuntu. Feel free to use v4+ if you know it's available. We also added a few flags. The `--name` flag allows us to refer specifically to that one running container, and even better it allows us to use that as its address on the network. We'll see that in a sec. The one other, since we're using `--name` is `--rm`. If we didn't use that, we'd have to run `docker rm db` before restarting our `db` cotainer since when it stops a container, it doesn't delete it and its logs and meta data until you tell it to. The `--rm` means toss all that stuff as soon as the container finishes and free up that name again.

Now, for fun we can use _another_ MongoDB containter (because it has the `mongo` client on it in addition to have the MongoDB server). Run this: `docker run -it --network=app-net --rm mongo:3 mongo --host db`. This will be one instance of a MongoDB container connecting to a different container over our Docker network. Cool, right? So let's make our Node.js app read and write to MongoDB!

## Connecting our Node.js App to MongoDB

This isn't a course in MongoDB or anything but more just to show you how to connect one app container to a database container as well as set you up for the next lesson Docker composes. And this sort of method work just as well for any DB: MySQL, Postgres, Redis, etc.

So first thing, let's add some logic to our app that reads and writes to MongoDB

```javascript
// more-or-less the example code from the hapi-pino repo
const hapi = require("@hapi/hapi");
const { MongoClient } = require("mongodb");
const url = process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017";
const dbName = "dockerApp";
const collectionName = "count";

async function start() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const server = hapi.server({
    host: "0.0.0.0",
    port: process.env.PORT || 3000
  });

  server.route({
    method: "GET",
    path: "/",
    async handler() {
      const count = await collection.count();
      return { success: true, count };
    }
  });

  server.route({
    method: "GET",
    path: "/add",
    async handler() {
      const res = await collection.insertOne({});
      return { inserted: res.insertedCount };
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

You could absolutely run this locally if you have MongoDB running on your host machine since the default connection string will connect to a local MonogDB. But we also left it open so we can feed the app an environmental variable so we can modify it to be a different container.

So build the container and run it using the following commands:

```bash
npm install mongodb@3.3 # you need to add mongodb to your project
docker build --tag=my-app-with-mongo .
docker run -p 3000:3000 --network=app-net --env MONGO_CONNECTION_STRING=mongodb://db:27017 my-app-with-mongo
```

Okay so we added a new endpoint and modified one. The first one is `/add` which will add an empty object (MongoDB will add an `_id` to it so it's not totally empty). It will then return how many items it successfully added to MongoDB (hopefully 1!). And then we modified the `/` route to return the count of items in the database. Great! This is how the basics of networking work in Docker.

One key thing here that we need to discuss: if you shut down that one Docker container, where is your data going to go? Well, it'll disappear. How do you mitigate this? Usually with some sort of volume that lives beyond the container, and usually by having more than one container of MongoDB running. It's beyond the scope of this course but you already have the tools you need to be able to do that.

Congrats! You've done basic networking in Docker. Now let's go use other tools to make this easier for us.

[mongo]: https://hub.docker.com/_/mongo
