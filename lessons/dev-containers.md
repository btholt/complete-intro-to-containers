---
order: 8
path: "/dev-containers"
title: "Using Containers for your Dev Environment"
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

## Visual Studio Code

As you may imagine, I'm a big fan of Visual Studio Code. And I'm a big fan of investing time to learn your tools very well. If you haven't [Burke Holland's course on Frontend Masters][burke] on Visual Studio Code. He as well touches on some of the things we're about to talk about here.

Visual Studio Code has a relatively recent feature that it can connect to remote environments (remote in the sense as in you're editing files not on your host.) You can use VSCode to connect to remote virtual machines (or really anything that's SSH-able), to WSL (Linux running on Windows), and finally to containers.

Go ahead and install [the Remote - Containers][remote] extension.

This takes everything one step further: you can actually set up someone's editor for them when they open your project. You can change settings, add extensions, define debugging, and control the container environment with the remote extension and dev containers. Let's go ahead and give it a shot!

Make a folder within your static-app project called `.devcontainer`. In there we'll put two files. The first one is the Dockerfile where we'll just set up our dev environment.

```Dockerfile
FROM node
RUN npm install -g eslint prettier
```

Just need the tools and environment, don't actually need to build anything or put the code in there. Visual Studio Code will handle that automatically. Next make a file inside `.devcontainer` called `devcontainer.json`. The folder name has leading `.`, the the JSON file does not.

```json
{
  "name": "Frontend Masters Sample",
  "dockerFile": "Dockerfile",
  "appPort": [3000],
  "runArgs": ["-u", "node"],
  "settings": {
    "workbench.colorTheme": "Night Owl",
    // "workbench.colorTheme": "Hot Dog Stand",
    "terminal.integrated.shell.linux": "/bin/bash"
  },
  "postCreateCommand": "npm install",
  "extensions": [
    // "somekittens.hot-dog-stand",
    "sdras.night-owl",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

From here, close Visual Studio Code and then reopen the project again. You should see a little prompt asking you if you want to re-open the project in a container. Click yes! If you miss that prompt, click the (normally green) button in the bottom left of VSCode that look sort like `><` but shoved together. It should have an option to open this project in a dev container.

**NOTE**: if you're on Windows and you're following along with WSL, you'll have to get the project _out_ of WSL before it'll let you re-open it in a container. This will hopefully be a smoother experience in the future. To get into Windows from WSL, click the same `><` logo in the bottom left and say open in Windows. From there the above instructions should work.

Couple of key things here:

- We can have two different Dockerfiles for dev and production. We can have one. I generally have two unless they overlap so much they're basically the same.
- We're setting up our colleagues for success by making sure everyone has the correct extensions installed for dev. In this case, I added Prettier and ESLint to my team's environment so they can have instant feedback when they're working.
- We can add settings to their environment (like formatting on save) so that everything just works the same for everyone. No worries: your team can override any of this if it's not for them.

This whole workflow works for VSCode users only so not everyone will get to take apart of the magic. However, at the end of it all, it's just a container for development environments and they have the Dockerfile. They can still build and run that via the techniques above!

From here you can get as complicated as you need, setting up memory dumps, tracing, and the like. I leave that as an exercise for you (as I'm not the most knowledgeable on how to do it) but whatever you can do with a bash script can be done by Docker for you!

[remote]: https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
[burke]: https://frontendmasters.com/workshops/visual-studio-code/
[hugo-project]: https://github.com/btholt/hugo-example
[hugo]: https://gohugo.io/
[hugo-builder]: https://hub.docker.com/r/jguyomard/hugo-builder/
