---
path: "/chroot"
title: "chroot"
order: 2.1
section: "Crafting Containers By Hand"
description: "chroot is the first of the important Linux kernel features that allow us to create contained processes without a whole virtualization layer. Brian shows how to use chroot to restrict a process to a certain file tree."
---

## chroot

I've heard people call this "cha-root" and "change root". I'm going to stick to "change root" because I feel less ridiculous saying that. It's a Linux command that allows you to set the root directory of a new process. In our container use case, we just set the root directory to be where-ever the new container's new root directory should be. And now the new container group of processes can't see anything outside of it, eliminating our security problem because the new process has no visibility outside of its new root.

Let's try it. Start up a Ubuntu VM however you feel most comfortable. I'll be using Docker (and doing containers within containers 🤯). If you're like me, run `docker run -it --name docker-host --rm --privileged ubuntu:bionic`. This will download the [official Ubuntu container][ubuntu] from Docker Hub and grab the version marked with the _bionic_ tag. In this case, _latest_ means it's the latest stable release (18.04.) You could put `ubuntu:devel` to get the latest development of Ubuntu (as of writing that'd be 19.10). `docker run` means we're going to run some commands in the container, and the `-it` means we want to make the shell interactive (so we can use it like a normal terminal.)

If you're in Windows and using WSL, just open a new WSL terminal in Ubuntu. ✌️

To see what version of Ubuntu you're using, run `cat /etc/issue`. `cat` reads a file and dumps it into the output which means we can read it, and `/etc/issue` is a file that will tell us what distro we're using. Mine says `Ubuntu 18.04.3 LTS \n \l`.

Okay, so let's attempt to use `chroot` right now.

1. Make a new folder in your home directory via `mkdir /my-new-root`.
1. Inside that new folder, run `echo "my super secret thing" >> /my-new-root/secret.txt`.
1. Now try to run `chroot /my-new-root bash` and see the error it gives you.

You should see something about failing to run a shell or not being able to find bash. That's because bash is a program and your new root wouldn't have bash to run (because it can't reach outside of its new root.) So let's fix that! Run:

1. `mkdir /my-new-root/bin`
1. `cp /bin/bash /bin/ls /my-new-root/bin/`
1. `chroot /my-new-root bash`

Still not working! The problem is that these commands rely on libraries to power them and we didn't bring those with us. So let's do that too. Run `ldd /bin/bash`. This print out something like this:

```bash
$ ldd /bin/bash
  linux-vdso.so.1 (0x00007fffa89d8000)
  libtinfo.so.5 => /lib/x86_64-linux-gnu/libtinfo.so.5 (0x00007f6fb8a07000)
  libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f6fb8803000)
  libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f6fb8412000)
  /lib64/ld-linux-x86-64.so.2 (0x00007f6fb8f4b000)
```

These are the libraries we need for bash. Let's go ahead and copy those into our new environment.

1. `mkdir /my-new-root/lib /my-new-root/lib64` or you can do `/my-new-root/lib{,64}` if you want to be fancy
1. Then we need to copy all those paths (ignore the lines that don't have paths) into our directory. Make sure you get the right files in the right directory. In my case above (yours likely will be different) it'd be two commands:
   1. `cp /lib/x86_64-linux-gnu/libtinfo.so.5 /lib/x86_64-linux-gnu/libdl.so.2 /lib/x86_64-linux-gnu/libc.so.6 /my-new-root/lib`
   1. `cp /lib64/ld-linux-x86-64.so.2 /my-new-root/lib64`
1. Do it again for `ls`. Run `ldd /bin/ls`
1. Follow the same process to copy the libraries for `ls` into our `my-new-root`.
   1. `cp /lib/x86_64-linux-gnu/libselinux.so.1 /lib/x86_64-linux-gnu/libpcre.so.3 /lib/x86_64-linux-gnu/libpthread.so.0 /my-new-root/lib`

Now, finally, run `chroot /my-new-root bash` and run `ls`. You should successfully see everything in the directory. Now try `pwd` to see your working directory. You should see `/`. You can't get out of here! This, before being called containers, was called a jail for this reason. At any time, hit CTRL+D or run `exit` to get out of your chrooted environment.

## cat exercise

Now try running `cat secret.txt`. Oh no! Your new chroot-ed environment doesn't know how to cat! As an exercise, go make `cat` work the same way we did above!

Congrats you just cha-rooted the \*\*\*\* out of your first environment!

[ubuntu]: https://hub.docker.com/_/ubuntu
