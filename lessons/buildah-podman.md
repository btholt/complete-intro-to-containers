---
path: "/buildah-podman"
order: 12
title: "Non-Docker Containers: Buildah and Podman"
section: "OCI Containers"
---

**NOTE**: Both of these tools _only work in Linux_. If you're using Windows and WSL, this work seamlessly. If you're on macOS, this will not work. You could try to run this within [the Buildah container][buildah-container] off of Docker Hub. This container has both Buildah and Podman. This is what I'm going tod.

## Intro

While a lot of the gravity of the container world centers on Docker and the Dockery ecosystem, there are other great projects that exist and are worthy of your consideration. I want to take the most brief detour to showcase the totally-open-source alternatives to Docker: [Buildah][buildah] and [Podman][podman]. Can we agree that containers projects have the cutest logos ever?

A lot of the non-Docker support is centered behind what's called the [Open Container Initiative][oci] which is a project underneath the Linux Foundation. Keep in mind that Docker supports the OCI; they're members of it. This is meant to encourage a healthy diversity of players in the field and to have certain common guidelines so that the various sorts of tools can work together. Everybody wins here.

We're going to talk about these two tools, Buildah and Podman, that allow you to create and run OCI container images. Whereas we've been using Docker to both build and run Docker containers, we're going to use Buildah to build containers and Podman to run them. In reality, with Docker we've been using `docker` to build containers and Docker Desktop has been running `dockerd` in the background to run the containers for us, so the same separation has existed even if we didn't have to know that directly.

There's a lot to these tools and they overlap quite a bit too. We're just going to introduce you to these and then move on.

## Buildah

### Installation

Follow [the instructions here][buildah-install] for your distro of Linux (if you're not using the container, I will be except for one part at thend):

This is for only if you're not using the Buildah container. Make sure you have a valid `/etc/containers/registries.conf`. If you don't have that file, put this there:

```
# This is a system-wide configuration file used to
# keep track of registries for various container backends.
# It adheres to TOML format and does not support recursive
# lists of registries.

# The default location for this configuration file is /etc/containers/registries.conf.

# The only valid categories are: 'registries.search', 'registries.insecure',
# and 'registries.block'.

[registries.search]
registries = ['docker.io', 'registry.fedoraproject.org', 'registry.access.redhat.com']

# If you need to access insecure registries, add the registry's fully-qualified name.
# An insecure registry is one that does not have a valid SSL certificate or only does HTTP.
[registries.insecure]
registries = []


# If you need to block pull access from a registry, uncomment the section below
# and add the registries fully-qualified name.
#
# Docker only
[registries.block]
registries = []
```

Lastly, make sure you have `runc` installed too. It should be available on every major package manager.

If you want to do it inside of Docker, run

```bash
docker run -it --rm -p 3000:3000 --privileged --mount type=bind,source="$(pwd)",target=/src  --mount type="volume",src=podman-data,target=/var/lib/containers tomkukral/buildah bash
```

This will run the Buildah / Podman container with your current directory mounted in at `/src`. Do note that this in Alpine Linux and you'll be dropped in ash, not bash which does have some differences. Sorta fun though, right? Building containers inside of your containers. Also do note that we're running it as `--privileged` which means the container has elevated privileges. Use this only when you need to.

We need a volume mount for where the built containers are going to be stored (both ones we build and ones we download from registries) and we need a bind mount for own code being mounted in. We're also exposing port 3000 because when we run the app inside the container (containers within containers) we'll tunnel that port through.

### Using Buildah

Buildah is the tool that allows you to build new containers. It actually allows many different ways of building containers, from writing bash scripts that define the containers to building containers interactively. We're going to do something a bit more familiar to you: Dockerfiles! Yes, Buildah can read and use Dockerfiles. So let's give it a shot.

```bash
buildah bud -f ./Dockerfile -t my-app-buildah . # instead of bud, you can use build-using-dockerfile
```

This accomplishes the same thing as `docker build`. It'll take a bit longer and for me it consumed a lot of memory. But once it's done you should see the image when you run `buildah images`. You can inspect it with `buildah inspect my-app-buildah`. Now, you can use Buildah a different way and start using this container interactively but I leave that to your exploration.

So to see our built container in Buildah (Buildah allows you to do some running of containers but most of that resides in Podman) run `buildah from my-app-buildah`. This will start a container running in the background (and not run the `CMD` in our Dockerfile.) From there, run `buildah run --net host my-app-buildah-working-container -- bash`. This will get us inside the container! You can try to run our project but it'll fail since we haven't connected MongoDB (and we're not going to right now.) Congrats! You built and ran a container without Docker! (again, since we already did it with lxc and lxd.)

## Podman

I'm going to do this inside of the [Buildah container][buildah-container] because this was quite difficult to set up outside of it. And in reality most of you will be doing this with Docker anyway so this is more of an academic exercise.

After having build your container above with Buildah, run this:

```bash
podman run --cgroup-manager cgroupfs -p 3000:3000 localhost/my-app-buildah
```

This will start Podman managing an instance of your Buildah-built container! This by-default will run your container in the foreground, you can run it in the background with `-d` added.

### Run your Buildah container with Docker

In order to do this part, you have to run this outside of a container.

We need to first transfer our container out of Buildah and into Docker. We also need to be aware that there are two ways to package a container: Docker and OCI. If we tell Buildah to push to Docker, it'll fix that automatically but be aware you can also use OCI (Open Container Initiative) images as well.

Just like you can push a container to Docker Hub, you can use the same mechanism within Buildah to push to a local Docker daemon (background process.) So ahead and run `buildah push localhost/my-app-buildah docker-daemon:my-app-buildah:latest`. This will move our app out Buildah and into Docker. Now if you run `docker run -it my-app-buildah bash` it should drop you into a running container. As a fun exercise, try to start the Node.js app and connect it to a running `mongo` container using the techniques we learned before. Now you have one container built using Docker connecting to a container built using Buildah. Pretty cool!

[buildah]: https://buildah.io/
[podman]: https://podman.io/
[install-buildah]: https://github.com/containers/buildah/blob/master/install.md
[oci]: https://www.opencontainers.org/
[buildah-container]: https://hub.docker.com/r/tomkukral/buildah
[buildah-install]: https://github.com/containers/buildah/blob/master/install.md
