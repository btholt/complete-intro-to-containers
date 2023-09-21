---
order: 6.3
path: "/visual-studio-code"
title: "Dev Containers with Visual Studio Code"
section: "Features in Docker"
description: "Containers can be used in conjunction with Visual Studio Code to automatically set up development environments for yourself and other developers working on the project. Brian shows how to set up dev containers specifically for Visual Studio Code."
---

## Visual Studio Code

As you may imagine, I'm a big fan of Visual Studio Code. And I'm a big fan of investing time to learn tools very well. If you haven't seen the [Burke Holland's course on Frontend Masters][burke] on Visual Studio Code I highly recommend you to do so. He as well touches on some of the things we're about to talk here.

Visual Studio Code has a relatively recent feature that it can connect to remote environments (remote in the sense as in you're editing files not on your host.) You can use VSCode to connect to remote virtual machines (or really anything that's SSH-able), to WSL (Linux running on Windows), and finally to containers.

Go ahead and install [the Remote - Containers][remote] extension.

This takes everything one step further: you can actually set up someone's editor for them when they open your project. You can change settings, add extensions, define debugging, and control the container environment with the remote extension and dev containers. Let's go ahead and give it a shot!

Make a folder within your static-app project called `.devcontainer`. In there we'll put two files. The first one is the Dockerfile where we'll just set up our dev environment.

```Dockerfile
FROM node:12-stretch
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
