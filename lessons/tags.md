---
path: "/tags"
title: "Tags"
order: 3.4
section: "Docker"
description: "Tags are an essential part of the Docker CLI that allow you to label your containers with referenceable tags and allows you to tie your app to specific versions of containers, whether that's a certain version of Linux or a particular version of Node.js (or both!)"
---

## Tags

So far we've just been running containers with random tags that I chose. If you run `docker run -it node` the tag implicitly is using the `latest` tag. When you say `docker run -it node`, it's the same as saying `docker run -it node:latest`. The `:latest` is the tag. This allows you to run different versions of the same container, just like you can install React version 15 or React version 16: some times you don't want the latest. Let's say you have a legacy application at your job and it depends on running on Node.js 8 (update your app, Node.js is already past end-of-life) then you can say

```bash
docker run -it node:8 bash
```

Once in the shell, run `node --version` and you'll see the Node.js version is 8._._! Neat! This is helpful because now we can fix our Node.js version to the one our app expects. Hop back over to [the Docker Hub page for the node container][node]. Take a look at all the version of the node container you can download. Let's try another one.

```bash
docker run node:12-alpine cat /etc/issue
```

You'll see this is running an entirely different OS all together: Alpine! [Alpine Linux][alpine] is a very, very tiny distro of Linux made for containers and specifically because it is tiny. Alpine containers are bare bones: if you want _anything_ in them, you're going to have to do it yourself. This is in opposition to the Ubuntu and Debian containers: they ship the kitchen sink with them which is both convenient and much bigger in size. Alpine images are about five megabytes whereas Ubuntu is close to two hundred megabytes. As you can imagine, this can make a difference in how fast you can deploy and can cost significantly less in terms of storage and network traffic. It's also in general better to have less unnecessary things in your containers: less is more in terms of security. If an attacker tries to execute a Python exploit on your container but your container doesn't have Python then their attack won't work.

We'll get more into how to ship containers to production but I'll leave you with this pro-tip: have a development container which has all the bells, whistles, debugging tools, etc. that you need. Then have a production container that's minimalist as possibly can be. You'll get the best of both worlds.

[node]: https://hub.docker.com/_/node/
[alpine]: https://hub.docker.com/_/alpine
