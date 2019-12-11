---
path: "/kompose"
order: 7.2
title: "Kompose"
section: "Multi Container Projects"
description: "Kompose converts a docker-compose.yml configuration to a Kubernetes configuration. Brian shows how to take the previous Docker Compose YAML file and running that same configuration through Kubernetes"
---

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

[ingress]: https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
[localhost]: http://localhost:3000
[aks]: https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough
[aws]: https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
[gcp]: https://cloud.google.com/kubernetes-engine/docs/quickstart
[kompose]: https://kompose.io/
[install-kompose]: https://kompose.io/installation/
