---
path: "/docker-images-with-docker"
title: "Docker Images with Docker"
order: 3.2
section: "Docker"
---

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
