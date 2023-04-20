---
path: "/docker-cli"
title: "Docker CLI"
order: 3.5
section: "Docker"
description: "There's a lot of features of the Docker CLI and while that won't necessarily be the focus of this workshop, Brian takes a moment to explain to you some of the additional available functionality."
---

Let's take a look at some more cool features of the Docker CLI.

### pull / push

`pull` allows you to pre-fetch container to run. P

```bash
docker pull jturpin/hollywood
docker run -it jturpin/hollywood hollywood # notice it's already loaded and cached here; it doesn't redownload it
```

That will pull the hollywood container from the user jturpin's user account. The second line will execute this fun container which is just meant to look a hacker's screen in a movie (it doesn't really do anything than look cool.)

`push` allows you to push containers to whatever registry you're connected to (probably normally Docker Hub or something like Azure Container Registry).

### inspect

```bash
docker inspect node:12-stretch
```

This will dump out a lot of info about the container. Helpful when figuring out what's going on with a container

### pause / unpause

As it looks, these pauses or unpause all the processes in a container. Feel free to try

```bash
docker run -dit jturpin/hollywood hollywood
docker ps # see container running
docker pause <ID or name>
docker ps # see container paused
docker unpause <ID or name>
docker ps # see container running again
docker kill <ID or name> # see container is gone
```

### exec

This allows you to execute a command against a running container. This is different from `docker run` because `docker run` will start a new container whereas `docker exec` runs the command in an already-running container.

```bash
docker run -dit jturpin/hollywood hollywood
docker ps # grab the name or ID
docker exec <ID or name> ps aux # see it output all the running processes of the container
```

If you haven't seen `ps aux` before, it's a really useful way to see what's running on your computer. Try running `ps aux` on your macOS or Linux computer to see everything running.

### import / export

Allows you to dump out your container to a tar ball (which we did above.) You can also import a tar ball as well.

### history

We'll get into layers in a bit but this allow you to see how this Docker image's layer composition has changed over time and how recently.

```bash
docker history node
```

### info

Dumps a bunch of info about the host system. Useful if you're on a VM somewhere and not sure what the environment is.

```bash
docker info
```

### top

Allows you to see processes running on a container (similar to what we did above)

```bash
docker run mongo
docker top <ID outputted by previous command> # you should see MongoDB running
```

### rm / rmi

If you run `docker ps --all` it'll show all containers you've stopped running in addition to the runs you're running. If you want to remove something from this list, you can do `docker rm <id or name>`.

If you want to remove an image from your computer (to save space or whatever) you can run `docker rmi mongo` and it'll delete the image from your computer. This isn't a big deal since you can always reload it again

### logs

Very useful to see the output of one of your running containers.

```bash
docker run -d mongo
docker logs <id from previous command> # see all the logs
```

### restart

Pretty self explanatory. Will restart a running container

### search

If you want to see if a container exists on Docker Hub (or whatever registry you're connected to), this will allow you to take a look.

```bash
docker search python # see all the various flavors of Python containers you can run
docker search node # see all the various flavors of Node.js containers you can run
```
