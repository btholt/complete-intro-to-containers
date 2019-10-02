---
path: "/lxc-lxd"
title: "lxc & lxd"
order: 2
---

## lxc

Before we hop into Docker, let's talk about its predecessor, `lxc`. Up until fairly recently, Docker was underpinned by `lxc`, which as you may guess stands for Linux Container. Linux Container is a low-level, flexible, and stable commandline tool for managing containers. It does a lot of what Docker does but lower level and less convenient to use. When would you use `lxc`? Probably only now and never again. `lxc` is rather basic in terms of functionality and not necessarily meant to be used by app developers.

# TODO install lxc

# TODO lxc example

## lxd

So what is `lxd` then? `lxd` is a REST API to `lxc` which some higher level features that make using `lxc` far more pleasant and useful. It's key to note that `lxd` has a dependency on `lxc`: you cannot use `lxd` without `lxc` whereas you can just use `lxc` without `lxd`.

We're not going to dive too much here into `lxd`: its purpose is different from Docker and we're not chasing this use case. In the words of one of the [LXC/LXD core maintainers][lxc-purpose]:

> LXD focuses on system containers, also called infrastructure containers. That is, a LXD container runs a full Linux system, exactly as it would be when run on metal or in a VM.

> Those containers will typically be long running and based on a clean distribution image. Traditional configuration management tools and deployment tools can be used with LXD containers exactly as you would use them for a VM, cloud instance or physical machine.

> In contrast, Docker focuses on ephemeral, stateless, minimal containers that won’t typically get upgraded or re-configured but instead just be replaced entirely. That makes Docker and similar projects much closer to a software distribution mechanism than a machine management tool.

As you can see by that last line, we're much more interested in Docker's purpose than `lxd`'s. Let's move on to that.

[lxc-purpose]: https://stgraber.org/2016/03/11/lxd-2-0-introduction-to-lxd-112/
