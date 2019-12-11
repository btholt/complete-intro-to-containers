---
path: "/docker-images-without-docker"
title: "Docker Images without Docker"
order: 3.1
section: "Docker"
description: "Docker give us the fabulous ability to use containers other people have used by pulling them Docker Hub which is like a package manager for containers. Brian shows us how to download a container, unpack it, and use it without Docker so you can know how to do it manually."
---

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
