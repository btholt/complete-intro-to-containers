---
path: "/kubernetes"
order: 7.1
title: "Kubernetes"
section: "Multi Container Projects"
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
- A **deployment** is where you describe what you want the state of your pods to be and then Kubernetes works to get your cluster into that state.

Here's the sad part: doing this in the Windows subsystem for Linux is tough. If you're following along in Windows, I'd say just grab a coffee and watch how this works. It's not important that you actually do this. If you're comfortable in PowerShell, it works well from there or if you can connect to a true Linux VM, it'll work well from there too. Otherwise, just relax while I do this from macOS.

So you're going to need at least one new CLI: `kubectl`. `kubectl` ([see here for how to install][kubectl]) is the tool that allows you to control _any_ Kubernetes cluster, be it local or in the cloud. It's the single unified CLI for managing Kubernetes.

After that you, you need to make a choice between `minikube` and using Docker Desktop's built in Kubernetes support. If it's all the same to you, I'd suggest using Docker Desktop's because it's easier to use.

- Docker Desktop ships with very simple Kubernetes support. It's nice to learn on but has some limitations. If you need to do more complicated things, get minikube. To enable Kubernetes on Docker Desktop, open the preferences of Docker Desktop, navigate to the Kubernetes tab, enable it, accept when it asks when if it can restart itself, and then wait a few minutes.
- `minikube` ([see here for how to install][minikube]) is a development tool to get your Kubernetes cluster running on your local computer. You will only ever use this locally.

You can have both installed, by the way. These will be called **contexts**. To switch between the two, you can `kubectl config use-context minikube` or `kubectl config use-context docker-desktop`. You can also shorten `use-context` to `use`.

If you're using minikube, make sure you run `minikube start`. If you're using Docker Desktop, it should be started already. Do a `kubectl cluster-info` to make sure. To see your nodes, run `kubectl cluster-info`. You should see a master node running.

## Kompose

Next tool we're going to use is one called [Kompose][kompose]. I'm showing you this tool because it's normally how I start out with Kubernetes. Kompose converts a docker-compose.yml configuration to a Kubernetes configuration. I find this to much more approachable than starting with the myriad configurations you need to get Kubernetes going.

[Click here][install-kompose] to see how to install Kompose on your platform.

So first let's modify our docker-compose.yml a bit to make it work for Kompose.

```yml
version: "3"
services:
  web:
    image: btholt/node-app # change build to image
    ports:
      - "3000:3000"
    links:
      - db
    labels:
      kompose.service.type: LoadBalancer # need this label for Kubernetes
    environment:
      MONGO_CONNECTION_STRING: mongodb://db:27017
  db:
    image: mongo:3
    ports:
      - "27017" # explicitly expose the port
```

Kompose (as of writing) doesn't have a way to easily use local images without pushing it to Docker Hub. If you want to use your own image, add back your `build: .` line and call the image something like `image: <your Docker Hub username>/node-app` and make sure you're logged into the Docker CLI via `docker login`. I've built the image that we've been building together and pushed it to `btholt/node-app` so feel free to just use mine. It's the same code.

We add the `LoadBalancer` label so that Kubernetes will know to expose this particular service to the outside world. What this actually does for you is it spins up a loadbalancer that will distribute the load amongst all of your running pods. Do note tha this one of three ways to expose a service to outside world (by default everything is only expose internally). The other two are NodePort and using an ingress controller. [This is a great explainer][ingress] if you're curious. For now LoadBalancer is perfect.

Lastly, we need to explicit about the port MongoDB exposes. Locally Docker was able to take care of it but Kubernetes needs us to be super explicity of what's exposed and what's not.

Okay, so now, a hack. Kompose expects kubectl to be listening on port 8080. We need to do that because it doesn't by default. So run `kubectl proxy --port=8080` and leave that running. You may need to open another terminal while that runs or run that last command in the background.

Now, you should be able to run `kompose up` and access your app on [`localhost:3000`][localhost]. Congrats! You're running Kuberenetes!

To get a bird's eye view of everything running, run `kubectl get all` to see everything happening.

Let's do some Kubernetes magic now. Run `kubectl scale --replicas=5 deployment/web` and run `kubectl get all`. Just like that, you have five instances of our Node.js app running and Kubernetes smartly routing traffic to each. If one of them becomes unhealthy, Kubernetes will automatically tear it down and spin up a new one. By setting up Kubernetes, you get a lot of cool stuff for free. If you're computer is starting to warm up, feel free to run `kubectl scale --replicas=1 deployment/web` to scale down.

Once you're done toying, run `kubectl delete all --all`. This will tear down everything.

## Convert

We did all of this from a docker-compose.yml file but that's just to get you started. What you want are the actual Kubernetes configuration files. To get those, run `kompose convert` which will spit out all of the various configurations you'll need for the services and deployments. I'm not going to get into today these configurations. Kubernetes is very powerful and has many knobs and levers. For now you can see what Kompose generates for you.

## To the cloud!

What's super fun is that kubectl is the same tool you'd use to control your production deployment. So everything you just learn would work against Azure, AWS, GCP, etc. All you have to do is change the context from minikube or docker-desktop to Azure, AWS, or GCP. I'm not going to do that but I'll drop the tutorials here so you can play around yourself. Do note these are often not free and if you're not careful, Kubernetes can get expensive!

- [Azure AKS][aks]
- [Amazon EKS][aws]
- [Google GKE][gcp]

[kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[minikube]: https://kubernetes.io/docs/tasks/tools/install-minikube/
