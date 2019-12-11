---
order: 6.2
path: "/dev-containers"
title: "Using Containers for your Dev Environment"
section: "Features in Docker"
description: "Containers can be useful as development environments. This makes them shareable, recreatable, portable, and makes them a great launching pad for building the production environment too. Brian shows how to use containers to build a Hugo (a Go-based static site generator) project."
---

So far we've talking about taking an app and using containers to prepare the apps to run. This is an obvious use case for them and one you're going to use a lot. But let's talk about a different use case for them: building development environments for your apps.

Let's paint a picture. Let's say you got a new job with a company and they're a Ruby shop (if you know Ruby, pretend you don't for a sec.) When you arrive, you're going to be given a very long, likely-out-of-date, complicated README that you're going to have to go look for and struggle to set up the proper version of Ruby, the correct dependencies installed, and that Mercury is in retrograde (just kidding.) Suffice to say, it's a not-fun struggle to get new apps working locally, particularly if it's in a stack that you're not familiar with. Shouldn't there be a better way? There is! (I feel like I'm selling knives on an informercial.)

Containers! What we can do is define a Dockerfile that sets up all our dependencies so that it's 100% re-createable with zero knowledge of how it works to everyone that approaches it. With bind mounts, we can mount our local code into the container so that we can edit locally and have it propagate into the development container. Let's give it a shot!

## Hugo

I'm not a Go developer. Go is a wonderful language with a rich ecosystem, it's just not what I've previously used. As such, Go is not set up on my computer. But happens if I move onto a new project that uses [Hugo][hugo]? Hugo is a great static site generation tool written in Go but one I'm not too familiar with. I could spend a decent amount of time getting everything set up … or I could use a container! After a quick Internet search, I stumbled across the container [hugo-builder][hugo-builder] which has Hugo all ready to go, I just have to bind in my source files. So let's give it a shot!

[Your new project is here][hugo-project].

Let's go from zero to running our new project in dev mode in three commands

```bash
git clone https://github.com/btholt/hugo-example.git
cd hugo-example/
# you could rewrite the --mount here as -v $PWD:/src
docker run --rm -it --mount type=bind,source="$(pwd)",target=/src -p 1313:1313 -u hugo jguyomard/hugo-builder hugo server -w --bind=0.0.0.0
```

How cool is this? We're zero to developing in Go in three commands! This is a super useful tool for getting developer environments up and running.

Notice we didn't copy our files in our files. Why? Well, we need our files to live on our host because we want to edit them locally and then run them in the container, right? If they lived in the container, they'd go away once we shut down the container.

## Aside on Node.js and Native Dependencies

This also works great for Node.js but there would be a problem here, our dependencies (unless you're running Linux as the host and as the container OS.) Whenever you run `npm install` it'll build you dependencies specifically for whatever OS you're on. This is only a problem if you have dependencies that native code in them (like `node-sass` for example) but it's good to know how to handle this.

Fastest way is to just ignore everything and run the container as-is. Once you have the container running, just `docker attach` to it and run `npm install` yourself inside of the container. A bit manual (and sort of defeating the purpose of containers) but effective.

The second option which is a bit gross in its own way to add `npm install &&` to the beginning of the `CMD` of your dev container. This will make it so that the node_modules are installed before starting your server. It's a bit of extra overhead on every restart of the app which can be annoying.

[hugo-project]: https://github.com/btholt/hugo-example
[hugo]: https://gohugo.io/
[hugo-builder]: https://hub.docker.com/r/jguyomard/hugo-builder/
