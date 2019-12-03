---
path: "/docker"
title: "Intro to Docker"
order: 3
---

This is probably why you're here: Docker. Docker is a commandline tool that made creating, updating packaging, distributing, and running containers significantly easier which in turns allowed them become very popular with not just system administraters but the programming populace at large. At its heart, it's a command line very similar to `lxc` that allows you to manage your containers but in a much more convenient way. Let's dive into the core concepts of Docker.

## Docker Desktop

Go ahead and install [Docker Desktop][desktop] right now. It will work for both Mac and Windows. Docker Desktop runs the Docker [daemon][daemon] (daemon just means a program that runs in the background all the time) so that we can download, run, and build containers. If you're on Mac, you'll see a cute little whale icon in your status bar. Feel free to poke around and see what it has. It will also take the liberty of installing the `docker` commandline tool so we can start doing all the fun things with Docker.

## Docker Hub

[Click here][hub] to head over to Docker Hub. Docker Hub is a public registry of pre-made containers. Think of it like an npm for containers. Instead of having to handcraft everything yourself, you can start out with a base container from Docker Hub and start from there. For example, instead of having to start with Ubuntu and install Node.js on it yourself, you can just start with a container that has Node.js already on it! There's a pre-made container for just about anything you can think of, and for those you can't it's pretty easy to find a good starting point so you can make your own bespoke, artisinal containers. If you feel so inclined, you can publish your own containers on the registry so others can take advantage of your discoveries.

Feel free to make an account on Docker Hub at this point. We won't be publishing anything to it during this workshop but it's a good idea to have one for when you want to!

## Images

These pre-made containers are called _images_. They basically dump out the state of the container, package that up, and store it so you can use it later. So let's go nab one of these image and run it! We're going to do it first without Docker to show you that you actually already knows what's going on.

First thing, let's go grab a container off of Docker Hub. Let's grab the latest Node.js container that runs Ubuntu.

### Docker Images without Docker

```bash
# start docker contanier with docker running in it connected to host docker daemon
docker run -ti -v /var/run/docker.sock:/var/run/docker.sock --privileged --rm --name docker-host docker:18.06.1-ce

# run stock alpine container
docker run --rm -dit --name my-alpine alpine:3.10 sh

# export running container's file system
docker export -o dockercontainer.tar my-alpine

# make container-root directory, export contents of container into it
mkdir container-root
tar xf dockercontainer.tar -C container-root/

# make a contained user, mount in name spaces
unshare --mount --uts --ipc --net --pid --fork --user --map-root-user chroot $PWD/container-root ash # this also does chroot for us
mount -t proc none /proc
mount -t sysfs none /sys
mount -t tmpfs none /tmp

# here's where you'd do all the cgroup rules making with the settings you wanted to
```

So, this isn't totally it. Docker does a lot more for you than just this like networking, volumes, and other things but suffice to say this core of what Docker is doing for you: creating a new environment that's isolated by namespace and limited by cgroups and chroot'ing you into it. So why did we go through all this ceremony? Well, it's because I want you to understand what Docker is doing for you, know that you _could_ do it by hand but since there's a tool that does for you you don't want to. I hold a strong personal belief that tools people need to understand their tools and what they do for them. Every tool you add to your environment adds complexity but should also add ease. If you don't understand the complexity the tool is solving, you resent it and don't get to fully appreciate nor take advantage of what the tool can fully offer.

So how often will you do what we just did? Never. 99% of container-utilizers have no idea this is what's happening under the hood. But now that you know it will make you embrace the complexity that Docker adds because you can see why you have it.

### Docker Images with Docker

So it's much easier to do what we did with Docker. Run this command:

```bash
docker run --interactive --tty run alpine:3.10 # or, to be shorter: docker run -it alpine:3.10
```

A bit easier to remember, right? This will drop you into a Alpine ash shell inside of a container as the root user of that container. When you're done, just run `exit` or hit CTRL+D. Notice that this will grab the [alpine][alpine] image from Docker for you and run it. The `run` part of the command is telling Docker you're going to be executing a container (as opposed to building it.) The `-it` part says you want to be dropped into the container interactively so you can run commands and inspect the container. By default containers run and then exit as soon as they're done. Go ahead and try `docker run alpine:3.10`. It'll look it did nothing but it actually starts the container and then, because it has nothing defined for it to do, it just exits.

So what if you wanted it to execute something? Try this:

```bash
docker run alpine:3.10 ls
```

Or let's switch to Ubuntu now, since it's more familiar to most. We'll talk about Alpine later on in-depth.

```bash
docker run ubuntu:bionic ls
```

The `ls` part at the end is what you pass into the container to be run. As you can see here, it executes the command, outputs the results, and shuts down the container. This is great for running a Node.js server. Since it doesn't exit, it'll keep running until the server crashes or the server exits itself.

So now what if we want to detach the container running from the foreground? Let's try that.

```bash
docker run --detach -it ubuntu:bionic # or, to be shorter: docker run -dit ubuntu:bionic
```

So it prints a long hash out and then nothing. Oh no! What happened to it!? Well, it's running in the background. So how do we get ahold of it?

```bash
docker ps
```

This will print out all the running containers that Docker is managing for you. You should see your container there. So copy the ID or the name and say:

```bash
docker attach <ID or name> # e.g. `docker attach 20919c49d6e5` would attach to that container
```

This allows you to attach a shell to a running container and mess around with it. Useful if you need to inspect something or see running logs. Feel free to type `exit` to get out of here. Run `docker run -dit ubuntu:bionic` one more time. Let's kill this container without attaching to it. Run `docker ps`, get the IDs or names of the containers you want to kill and say:

```bash
docker kill <IDs or names of containers> # e.g. `docker kill fae0f0974d3d 803e1721dad3 20919c49d6e5` would kill those three containers
```

A fun way to kill all runnung containers would be

```bash
docker kill $(docker ps -q)
```

The `$()` portion of that will evaluate whatever is inside of that first and plug its output into the second command. In this case, `docker ps -q` returns all the IDs and nothing else. These are then passed to `docker kill` which will kill all those IDs. Neat!

## --name and --rm

Let's make it a bit easier to keep track of these. Try this

```bash
docker run -dit --name my-ubuntu ubuntu:bionic
docker kill my-ubuntu
```

Now you can refer to these by a name you set. But now if you tried it again, it'd say that `my-ubuntu` exists. If you run `docker ps --all` you'll see that the container exists even if it's been stopped. That's because Docker keeps this metadata around until you tell it to stop doing that. You can run `docker rm my-ubuntu` which will free up that name or you can run `docker container prune` to free up all existing stopped containers (and free up some disk space.)

In the future you can just do

```bash
docker run --rm -dit --name my-ubuntu ubuntu:bionic
docker kill my-ubuntu
```

This will automatically clean up the container when it's done.

## Node.js on Containers

So now what if we wanted to run a container that Node in it? The default Ubuntu container doesn't have Node.js installed. Let's use a different container!

```
docker run -it node:12-stretch
```

The version here is we're using is Node.js version 12 and Stretch refers to the version of Debian (which is what the Node.js uses by default.)

Notice this drops us into the Node.js REPL which may or may not be what you want. What if we wanted to be dropped into bash of that container? Easy! You already know how!

```bash
docker run -it node:12-stretch bash
```

Remember, after we identify the container ([node][node]), anything we put after get's evaluated instead of the default command identified by the container (in the container `node`'s case, it runs the command `node` by default). This allows us to run whatever command we want! In this case, we're exectuing `bash` which puts us directly into a bash shell.

So what flavor of Linux is the `node` image running? Honestly, I didn't even remember when I was writing this. But it's easy to find out! There's a file on every\* Linux OS that has in it what sort of Linux it's running. If we run `cat /etc/issue` it'll show us what sort of Linux it is. `cat` is a way to output a file's contents to the terminal. Try running the two commands

```bash
docker run ubuntu:bionic cat /etc/issue # hopefully this shouldn't surprise you
docker run node:12-stretch cat /etc/issue # ????
```

We'll get into later how to select which Linux distros you should use but for now this is just a fun exercise.

## Tags

So far we've just been running containers with random tags that I chose. If you run `docker run -it node` the tag implicitly is using the `latest` tag. When you say `docker run -it node`, it's the same as saying `docker run -it node:latest`. The `:latest` is the tag. This allows you to run different versions of the same container, just like you can install React version 15 or React version 16: some times you don't want the latest. Let's say you have a legacy application at your job and it depends on running on Node.js 8 (update your app, Node.js is already past end-of-life) then you can say

```bash
docker run -it node:8 bash
```

Once in the shell, run `node --version` and you'll see the Node.js version is 8._._! Neat! This is helpful because now we can fix our Node.js version to the one our app expects. Hop back over to [the Docker Hub page for the node container][node]. Take a look at all the version of the node container you can download. Let's try another one.

```bash
docker run node:alpine cat /etc/issue
```

You'll see this is running an entirely different OS all together: Alpine! [Alpine Linux][alpine] is a very, very tiny distro of Linux made for containers and specifically because it is tiny. Alpine containers are bare bones: if you want _anything_ in them, you're going to have to do it yourself. This is in opposition to the Ubuntu and Debian containers: they ship the kitchen sink with them which is both convenient and much bigger in size. Alpine images are about five megabytes whereas Ubuntu is close to two hundred megabytes. As you can imagine, this can make a difference in how fast you can deploy and can cost significantly less in terms of storage and network traffic. It's also in general better to have less unnecessary things in your containers: less is more in terms of security. If an attacker tries to execute a Python exploit on your container but your container doesn't have Python then their attack won't work.

We'll get more into how to ship containers to production but I'll leave you with this pro-tip: have a development container which has all the bells, whistles, debugging tools, etc. that you need. Then have a production container that's minimalist as possibly can be. You'll get the best of both worlds.

## CLI

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
docker inspect node
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

[ubuntu]: https://hub.docker.com/_/ubuntu
[alpine]: https://hub.docker.com/_/alpine
[node]: https://hub.docker.com/_/node/
[desktop]: https://www.docker.com/products/docker-desktop
[hub]: https://hub.docker.com/search?q=&type=image
[alpine]: https://www.alpinelinux.org/
[daemon]: https://en.wikipedia.org/wiki/Daemon_(computing)
[cgmanager]: https://linuxcontainers.org/cgmanager/
