---
path: "/podman"
order: 8.1
title: "Podman"
section: "OCI (Non-Docker) Containers"
description: "Podman allows you to run OCI or Docker containers. Brian takes the Buildah container that was built in the previous section and runs it with Podman."
---

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
