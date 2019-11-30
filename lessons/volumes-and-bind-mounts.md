---
title: "Volumes and Bind Mounts"
path: "/volumes-and-bind-mounts"
order: 8
---

So far we've been dealing with self-contained containers. Normally this is all you ever want: containers that can spin up and spin down as frequently as they need to. They're ephemeral, temporary, and disposable. None of these containers are "snowflakes". When I say snowflakes, picture you're running a server that's serving a Wordpress site. Imagine setting up this server, SSH'ing into the server, and setting everything up to be just right and tuned to the exact way you need it. This would be a snowflake server: if someone goes and deletes this server, you're screwed. You have to go and spend a bunch of time re-setting up this server. This is exactly the sort of thing we're trying to avoid with containers. We want to make our servers easy to reproduce whenever we want so we can spin up and spin down servers at will.

However not everything can fit neatly into a container all the time. Sometimes our containers need to be stateful in some capacity. Sometimes our containers need to read and write to the host. This is fundamentally at odds with the idea of a stateless, able-to-create-and-destroy-anytime container that we've been adhering to thusfar. So what are we to do?

Enter volumes and bind mounts. Both of these are methods of reading and writing to the host but with slight-but-important differences of when to use which. We'll go over both.

## Bind Mounts

Let's start here because this is easier to see the use case for. Bind mounts allow you to mount files from your host computer into your container. This allows you to use the containers a much more flexible way than previously possible: you don't have to know what files the container will have _when you build it_ and it allows you to determine those files _when you run it_.

Let's go over an example of how this could be useful.

In the previous project, we used the NGINX container to build a container with our static assets baked into the container. In general this what I recommend you do since now we can ship that container anywhere and it'll just work. It's totally self-contained. But what if we just want to run a NGINX container locally to test stuff out? Sure, we could make a new Dockerfile and write it, but wouldn't it be cool if we could just use the NGINX container directly? We can! Let's try it. Go back to your static site project from the previous lesson. Let's use the `nginx` container to serve directly from it.

```bash
# from the root directory of your CRA app
docker run --mount type=bind,source="$(pwd)"/build,target=/usr/share/nginx/html -p 8080:80 nginx
```

This is how you do bind mounts. It's a bit verbose but necessary. Let's dissect it.

- We use the `--mount` flag to identify we're going to be mounting something in from the host.
- As far as I know the only two types are `bind` and `volume`. Here we're using bind because we to mount in some piece of already existing data from the host.
- In the source, we identify what part of the host we want to make readable-and-writable to the container. It has to be an absolute path (e.g we can't say `"./build"`) which is why use the `"$(pwd)"` to get the **p**resent **w**orking **d**irectory to make it an absolute path.
- The target is where we want those files to be mounted in the container. Here we're putting it in the spot that NGINX is expecting.
- As a side note, you can mount as many mounts as you care to, and you mix bind and volume mounts. NGINX has a default config that we're using but if we used another bind mount to mount an NGINX config to `/etc/nginx/nginx.conf` it would use that instead.

Again, it's preferable to bake your own container so you don't have to ship the container and the code separately; you'd rather just ship one thing that you can run without much ritual nor ceremony. But this is a useful trick to have in your pocket.

## Volumes

Bind mounts are great for when you need to share data between your host and your container as we just learned. Volumes, on the other hand, are so that your containers can maintain state between runs. So if you have a container that runs and the next time it runs it needs the results from the previous time it ran, volumes are going to be helpful. Volumes can not only be shared by the same container-type between runs but also between different containers. Maybe if you have two containers and you want to log to consolidate your logs to one place, volumes could help with that.

They key here is this: bind mounts are file systems managed the host. They're just normal files in your host being mounted into a container. Volumes are different because they're a new file system that Docker manages that are mounted into your container. These Docker-managed file systems are not visible to the host system (they can be found but it's designed to be.)

Let's make a quick Node.js app that reads from a file that a number in it, prints it, writes it to a volume, and finishes. Create a new Node.js project.

```bash
mkdir docker-volume
cd docker-volume
touch index.js Dockerfile
```

Inside that Node.js file, put this:

```javascript
const fs = require("fs").promises;
const path = require("path");

const dataPath = path.join(process.env.DATA_PATH || "./data.txt");

fs.readFile(dataPath)
  .then(buffer => {
    const data = buffer.toString();
    console.log(data);
    writeTo(+data + 1);
  })
  .catch(e => {
    console.log("file not found, writing '0' to a new file");
    writeTo(0);
  });

const writeTo = data => {
  fs.writeFile(dataPath, data.toString()).catch(console.error);
};
```

Don't worry too much about the Node.js. It looks for a file `$DATA_PATH` if it exists or `./data.txt` if it doesn't and if it exists, it reads it, logs it, and writes back to the data file after incrementing the number. If it just run it right now, it'll create a `data.txt` file with 0 in it. If you run it again, it'll have `1` in there and so on. So let's make this work with volumes.

```dockerfile
FROM node:alpine
COPY --chown=node:node . /src
WORKDIR /src
CMD ["node", "index.js"]
```

Now run

```bash
docker build --tag=incrementor .
docker run incrementor
```

Every time you run this it'll be the same thing. This is nothing is persisted once the container finishes. We need something that can live between runs. We could use bind mounts and it would work but this data is only designed to be used and written to within Docker which makes volumes preferable and recommended by Docker. If you use volumes, Docker can handle back ups, clean ups, and more security for you. If you use bind mounts, you're on your own.

So, without having to rebuild your container, try this

```bash
docker run --env DATA_PATH=/data/num.txt --mount type=volume,src=incrementor-data,target=/data incrementor
```

Now you should be to run it multiple times and everything should work! We use the `--env` flag to set the DATA_PATH to be where we want Node.js to write the file and we use `--mount` to mount a named volume called `incrementor-data`. You can leave this out and it'll be an anonymous volume that will persist beyond the container but it won't automatically choose the right one on future runs. Awesome!

## named pipes, tmpfs, and wrap up

Prefer to use volumes when you can, use bind mounts where it makes sense. If you're still unclear, the [official Docker][storage] docs are pretty good on the subject.

There are two more that we didn't talk about, `tmpfs` and `npipe`. The former is Linux only and the latter is Windows only (we're not going over Windows containers at all in this workshop.) `tmpfs` imitates a file system but actually keeps everything in memory. This is useful for mounting in secrets like database keys. The latter is useful for mounting third party tools for Windows containers. If you need more info than that, refer to the docs. I've never directly used either.

[storage]: https://docs.docker.com/storage/
