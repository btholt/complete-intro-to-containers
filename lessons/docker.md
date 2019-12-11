---
path: "/getting-set-up-with-docker"
title: "Getting Set Up with Docker"
order: 3.0
section: "Docker"
description: "This is probably why you're here: Docker. Docker is a commandline tool that made creating, updating packaging, distributing, and running containers significantly easier which in turns allowed them become very popular with not just system administraters but the programming populace at large."
---

This is probably why you're here: Docker. Docker is a commandline tool that made creating, updating packaging, distributing, and running containers significantly easier which in turns allowed them become very popular with not just system administraters but the programming populace at large. At its heart, it's a command line to achieve what we were doing with cgroups, namespaces, and chroot but in a much more convenient way. Let's dive into the core concepts of Docker.

## Docker Desktop

Go ahead and install [Docker Desktop][desktop] right now. It will work for both Mac and Windows. Docker Desktop runs the Docker [daemon][daemon] (daemon just means a program that runs in the background all the time) so that we can download, run, and build containers. If you're on Mac, you'll see a cute little whale icon in your status bar. Feel free to poke around and see what it has. It will also take the liberty of installing the `docker` commandline tool so we can start doing all the fun things with Docker.

## Docker Hub

[Click here][hub] to head over to Docker Hub. Docker Hub is a public registry of pre-made containers. Think of it like an npm for containers. Instead of having to handcraft everything yourself, you can start out with a base container from Docker Hub and start from there. For example, instead of having to start with Ubuntu and install Node.js on it yourself, you can just start with a container that has Node.js already on it! There's a pre-made container for just about anything you can think of, and for those you can't it's pretty easy to find a good starting point so you can make your own bespoke, artisinal containers. If you feel so inclined, you can publish your own containers on the registry so others can take advantage of your discoveries.

Feel free to make an account on Docker Hub at this point. We won't be publishing anything to it during this workshop but it's a good idea to have one for when you want to!

[ubuntu]: https://hub.docker.com/_/ubuntu
[alpine]: https://hub.docker.com/_/alpine
[node]: https://hub.docker.com/_/node/
[desktop]: https://www.docker.com/products/docker-desktop
[hub]: https://hub.docker.com/search?q=&type=image
[alpine]: https://www.alpinelinux.org/
[daemon]: https://en.wikipedia.org/wiki/Daemon_(computing)
[cgmanager]: https://linuxcontainers.org/cgmanager/
