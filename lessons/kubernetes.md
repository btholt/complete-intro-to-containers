---
path: "/kubernetes"
order: 11
title: "Kubernetes, Swarm, Mesos, and Beyond"
---

I like to tell people that containers are containers are the "simple" (simple is a relative term here) part and Kubernetes is the "hard" (hard isn't relative; Kubernetes is really hard) part. So if this feels hard, it's because it is.

NOTE: Because Kubernetes is long, it's often abbreviates at k8s (k then eight letters then s.)

So let's talk about use cases. Containers by themselves are useful for many, many use cases like production apps, machine learning, setting up environments, developer environments, and one-off experimentations. Kubernetes builds on containers (read: you need to know containers to use Kubernetes.) Kubernetes is a container orchestration tool. It allows you to manage large, complicated clusters of containers to multiple different hosts. It's a complicated tool that solves complicated problems. As such, we are going to do a hello world so you can understand what it is, what it can do, and then leave you to explore more on your own.

So let's go over a few fundamental concepts here.

- The **master** is a server that coordinates everything else. This is the brain on of your cluster. Some cloud providers actually won't charge you to run the master.
- **Nodes** (not to be confused with Node.js) are the worker servers that are actually going to be running your containers. One node can one or multiple containers. If you're running machine learning and you need big, beefy servers to churn through the learning, your node may only run one container. If you're running a Node.js server like we are, you'll have many containers on one node.
- Technically, a Node is just a deploy target. It could itself be a VM or a container, or as we said it could be a metal-and-silicon server. It's not really important. Just think of it as a destination for containers.
- A **pod** is bascially an atom to a cluster: it's a thing that can't be divided and thus needs to be deployed together. Imagine if you had several types of containers that all worked together as one unit and wouldn't work without each other. In this case, you'd put those into a pod. In many cases and what we're going to do today is do one-container-one-pod. Our app stands alone and thus can be deployed independently. We'll keep the MongoDB pod and app pod separate because they can scale individually.
- A **service** is a group of pods that make up one backend (services can be other things but bear with me for a second), so to speak. Think one microservice is a group of microservices. Pods are scaling up and down all the time and thus it's unreliable to rely on a single pod's IP. So if I tell the User service to rely on this specific IP for the Admin service, that IP might disappear as that pod is scalled up and down. Enter services. This is a reliable entry point so that these services can talk to each other independent of the relative scale of each other. Like you can have one-container-one-pod, you can have one-pod-one-service as well which means you can have one-container-one-pod-one-service. Services can be more than a backend, they can machine learning nodes, database, caches, etc.

Here's the sad part: doing this in the Windows subsystem for Linux is tough. If you're following along in Windows, I'd say just grab a coffee and watch how this works. It's not important that you actually do this. If you're comfortable in PowerShell, it works well from there or if you can connect to a true Linux VM, it'll work well from there too. Otherwise, just relax while I do this from macOS.

So you're going to need two different CLIs installed: `kubectl` and `minikube`

- `kubectl` ([see here for how to install][kubectl]) is the tool that allows you to control _any_ Kubernetes cluster, be it local or in the cloud. It's the single unified CLI for managing Kubernetes.
- `minikube` ([see here for how to install][minikube]) is a development tool to get your Kubernetes cluster running on your local computer. You will only ever use this locally.

[kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[minikube]: https://kubernetes.io/docs/tasks/tools/install-minikube/
