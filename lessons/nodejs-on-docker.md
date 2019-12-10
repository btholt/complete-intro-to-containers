---
path: "/nodejs-on-docker"
title: "Node.js on Docker"
order: 3.3
section: "Docker"
---

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
