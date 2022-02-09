[Complete Intro to Containers (feat. Docker)][course]

[![Frontend Masters](/lessons/images/FrontendMastersLogo.png)][fem]

- [Please click here][website] to head to the course website.
- See the [course on Frontend Masters][course]

# Issues and Pull Requests

Please file issues and open pull requests here! Thank you!

# Getting Set Up

## For Everyone

[Install Visual Studio Code](https://code.visualstudio.com). For one section of the course I'll go over some of how VSCode and containers work well together. The rest of the course you can use whatever editor you want.

## For macOS and Linux

Please make sure you have the following things installed and ready to go!

- For Mac: [Docker Desktop Community](https://www.docker.com/products/docker-desktop)
- For Linux: [Docker Engine Community](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

## For Windows

If **you have Windows 10 Professional** (it doesn't work in Home), try [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/wsl2-install) and [Docker for WSL 2](https://docs.docker.com/docker-for-windows/wsl-tech-preview/). WSL stands for Window Subsystem for Linux. It allows you to run Linux within Windows. That's what I'll be using. WSL 2 works faster than WSL1 but it's harder to set up since it's still in preview.

If you do not have Windows 10 Professional and you do not want to buy it, [follow this blog post](https://medium.com/@mbyfieldcameron/docker-on-windows-10-home-edition-c186c538dff3) to install VirtualBox and a Linux VM so you can follow inside of Linux. I'd suggest using Ubuntu.

Or, if you know PowerShell really well and know how to translate bash commands to PowerShell commands, feel free to install [Docker Desktop Community](https://www.docker.com/products/docker-desktop) and do everything from PowerShell (honestly it shouldn't be too bad.)

## Verify Docker installation:

Make sure when you go to a bash prompt and type `docker info` that it outputs system info and doesn't error out. This will let you know that everything is working.

Once you have Docker up and running, please run the following. This will pull most of the containers you will need up front.

```bash
docker pull ubuntu:bionic
docker pull node:12-stretch
docker pull node:12-alpine
docker pull nginx:1.17
docker pull mongo:3
docker pull jguyomard/hugo-builder:0.55
```

# License

The content of this workshop is licensed under CC-BY-NC-4.0. Feel free to share freely but do not resell my content.

The code, including the code of the site itself and the code in the exercises, are licensed under Apache 2.0.

[website]: https://btholt.github.io/complete-intro-to-containers/
[fem]: https://www.frontendmasters.com
[course]: https://frontendmasters.com/courses/complete-intro-containers/