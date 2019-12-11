---
title: "Bind Mounts"
path: "/bind-mounts"
order: 6.0
section: "Features in Docker"
description: "Let's start here because this is easier to see the use case for. Bind mounts allow you to mount files from your host computer into your container. This allows you to use the containers a much more flexible way than previously possible."
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

[storage]: https://docs.docker.com/storage/
