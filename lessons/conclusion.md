---
path: "/conclusion"
order: 13
title: "Conclusion"
---

## What you learned

You're done! Congratulations! You've successfully learned the fundamentals of containers and Docker. As a recap, here's what we went over:

- What a container is
  - How to use chroot to isolate a file system
  - How to use namespaces to isolate a tree of processes from other processes, networks, etc.
  - How to use cgroups to limit a tree of processes on how much CPU, memory, etc. can use
- What Docker is and where it can be useful
- How to write Dockerfiles for development and production
- How to set up networks in Docker
- How to set up bind mounts and volumes in Docker
- Using Docker Compose to set up a multicontainer setup
- Kubernetes and a very small introduction to large container orchestrations
- An intro to the great container ecosystem with OCI, Podman, and Buildah

## What you immediately helps you

You're probably not going to jumping directly into massive cloud-scale deployments of Kubernetes after this tutorial (or I'll be very impressed if you do!) But we did take away some things that should be immediately useful to you in your day-to-day:

- How to make a shareable developer container
- How to use that shareable container with Visual Studio Code
- How to get up and going with both development and production containers
- How to start a smaller-scale multi container project

## The future

Containers are just becoming more and more important to the greater container ecosystem. Big cloud providers like Microsoft Azure, Amazon Web Services, and Google Cloud Platform are all making large bets that that's how your team will be shipping code in the future. They're making big bets like the various Kubernetes platforms, Azure Container Instances, AWS Fargate, Google Cloud Run, Visual Studio Online, and a myriad of others.

### Container runtime alternatives to Docker

- [lxc & lxd][lxc] – Docker used to be based on these technologies (and has since moved on.) These days lxd is more used for long-running containers that are provisioned at runtime as opposed to at build time like Docker. You'll typically provision these containers with some like Chef, Salt, Ansible, Terraform or the like.
- [rkt][rkt] – rkt fits much more of Docker's use case. Core to rkt is the idea of a pod. Pods are the same sorts of pods that you find in Kubernetes, making them great for development with Kubernetes in mind. rkt is developed by CoreOS.

Both rkt and lxd can execute Docker and OCI containers.

### Swarm, Mesos, and other orchestration systems

- [Docker Swarm][swarm] – Docker Swarm is built right into Docker and thus well suited to be used with Docker. Docker Swarm still has services but doesn't have the concept of pods. The idea of a Swarm is to make multiple Docker hosts present together as one host. On the whole, Swarm is a simpler product to get started with than Kubernetes but may be too basic for large, enterprise apps.
- [Apache Mesos][mesos] – Mesos is an open source project bourne out of Berkeley that was adopted and furthered by Twitter. While it is a powerful and flexible tool, it comes with the price of being a very complicated tool and one I haven't been able to really wrap my mind around.
- [Hashicorp Nomad][nomad] – Nomad is a new comer on the scene from the purveyors of Vagrant, Terraform, and other well-known dev tools. Nomad aims to be _only_ a container orchestration tool and none of the other parts like load balancer, service discovery, secrets manager, etc. whereas Kubernetes handles all of those things. While is it new, they do have some big customers with a slowly-growing fanbase.

### Container OSs

Something we didn't discuss here is which container host operating system you use. We're talking about the operating system of the machine that's going to be running the containers, not the actual containers' operating system. While something like Alpine is great for running in containers, it would be a terrible fit for actually running the containers. Let's look at a few popular host operating systems for container deployments.

- [CoreOS Container Linux][coreos] – A minimal Linux host OS that ships with a bunch of helpful tools for running containers (typically via their rkt engine) and Kubernetes. They're well established and liked in the container world. They were recently acquired by Red Hat who itself was recently acquired by IBM.
- [RancherOS][rancher] – A fascinating Linux distro where all processes are containers and PID 1 is Docker. As you can imagine, if everything is a container then the whole OS is very oriented towards optimizing container usage.
- [Ubuntu][ubuntu] – I mean, Ubuntu is great and it works just fine for running containers, as does Debian, Fedora, and other normal Linux distros.
- [DC/OS][dcos] – People strongly associate DC/OS with Mesos because it runs based on Mesos but in reality it can be used as an OS for anything containers. From their own docs: "_DC/OS (the Distributed Cloud Operating System) is an open-source, distributed operating system based on the Apache Mesos distributed systems kernel. DC/OS manages multiple machines in the cloud or on-premises from a single interface; deploys containers, distributed services, and legacy applications into those machines; and provides networking, service discovery and resource management to keep the services running and communicating with each other._"
- [VMWare Photon][photon] – a relatively new project from VMWare that integrates with their other products like vSphere

## Wrap Up

Again, congratulations. This is a deep course with a lot of breadth thrown at you. This will probably take several exposures to really sink in and that's common for deeply technical things like this. But in the end I think you'll be a better dev for it whether you're writing CSS, Haskell, or Node.js. I hope you enjoyed and let me know if you liked it!

-- Brian

[lxc]: https://linuxcontainers.org/lxc/introduction/
[rkt]: https://coreos.com/rkt/
[nomad]: https://www.nomadproject.io/
[swarm]: https://docs.docker.com/engine/swarm/
[mesos]: http://mesos.apache.org/
[coreos]: https://coreos.com/
[rancher]: https://rancher.com/rancher-os/
[ubuntu]: https://ubuntu.com/
[dcos]: https://dcos.io/
[photon]: https://vmware.github.io/photon/
