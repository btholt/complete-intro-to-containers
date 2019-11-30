---
path: "/what-are-containers"
title: "What Are Containers?"
order: 2
---

Containers are probably simpler than you think they are. Before I took a deep dive into what they are, I was very intimidated by the concept of what containers were. I thought they were for one super-versed in Linux and sysadmin type activties. In reality, the core of what containers are is just a few features of the Linux kernel duct-taped together. Honestly, there's no single concept of a "container": it's just using a few features of Linux together to achieve isolation. That's it.

So how comfortable are you with the command line? This course doesn't assume wizardry with bash or zsh but this probably shouldn't be your first adventure with it. If it is, [check out James's course on it][james]. This course will give you more than we'll need to keep up with this course.

## Why Containers

Let's start with why first, why we need containers.

### Bare Metal

Historically, if you wanted to run a web server, you either set up your own or you rented a literal server somewhere. We often call this "bare metal" because, well, your code is literally executing on the processor with no abstraction. This is great if you're extremely performance sensitive and you have ample and competent staffing to take care of these servers.

The problem with running your servers on the bare metal is you come become extremely inflexible. Need to spin up another server? Call up Dell or IBM and ask them to ship you another one, then get your tech to go install the phyiscal server, set up the server, and bring into the server farm. That only takes a month or two right? Pretty much instant. 😄

Okay, so now at least you have a pool of servers responding to web traffic. Now you just to worry about keeping the operating system up to date. Oh, and all the drivers connecting to the hardware. And all the software running on the server. And replacing the components of your server as new ones come out. Or maybe the whole server. And fixing failed components. And network issues. And running cables. And your power bill. And who has physical access to your server room. And the actual temperature of the data center. And paying a ridiculous Internet bill. You get the point. Managing your own servers is _hard_ and requires a whole team to do it.

### Virtual Machines

Virtual machines are the next step. This is adding a layer of abstraction between you and the metal. Now instead of having one instance of Linux running on your computer, you'll have multiple guest instances of Linux running inside of a host instance of Linux (it doesn't have to be Linux but I'm using it to be illustrative.) Why is this helpful? For one, I can have one beefy server and have it spin up and down servers at will. So now if I'm adding a new service, I can just spin up a new VM on one of my servers (providing I have space to do so.) This allows a lot more flexibility.

Another thing is I can separate two VMs from each other on the same machine _totally_ from each other. This affords a few nice things.

1. Imagine both Coca-Cola and Pepsi lease a server from Microsoft Azure to power their soda making machines and hence have the recipe on the server. If Microsoft puts both of these servers on the same physical server with no separation, one soda-maker could just SSH into the server and browse the competitor's files and find the secret recipe. So this is a massive security problem.
1. Imagine one of the soda-makers discovers that they're on the same server as their competitor. They could drop a [fork bomb][fork-bomb] and devour all the resources their competitors' website was using.
1. Much less nefariously, any person on a shared-tenant server could unintentionally crash the server and thus ruin everyone's day.

So enter VMs. These are individual operating systems that as far as they know, are running on bare metal themselves. The host operating system offers the VM a certain amount resources and if that VM runs out, they run out and they don't affect other guest operating systems running on the server. If they crash their server, they crash their guest OS and yours hums along unaffected. And since they're in a guest OS, they can't peek into your files because their VM has no concept of any sibling VMs on the machine so it's much more secure.

All these above features come at the cost of a bit of performance. Running an operating system within an operating system isn't free. But in general we have enough computing power and memory that this isn't the primary concern. And of course, with abstraction comes ease at the cost of additional complexity. In this case, the advantages very much outweigh the cost most of the time.

If you want to play with VMs, Jem's course does a great job showing you how to do it with his [Full Stack course][jem].

### Public Cloud

So, as alluded to above, you can nab a VM from a public cloud provider like Microsoft Azure or Amazon Web Services. It will come with a pre-allocated amount of memory and computing power (often called virtual cores or vCores because their dedicated cores to your virutal machine.) Now you no longer have to manage the expensive and difficult business of maintaining a data center but you do have to still manage all the software of it yourself: Microsoft won't update Ubuntu for you but they will make sure the hardware is up to date.

But now you have the great ability spin up and spin down virtual machines in the cloud, giving you access to resources with the only upper bound being how much you're willing to pay. And we've been doing this for a while. But the hard part is they're still just giving you machines, you have to manage all the software, networking, provisioning, updating, etc. for all these servers. And lots of companies still do! Tools like Terraform, Chef, Puppet, Salt, etc. help a lot with things like this because they can make spinning up new VMs easy because they can handle the software needed to get it going.

We're still paying the cost of running a whole operating system in the cloud inside of a host operating system. It'd be nice if we could just run the code inside the host OS without the additional expenditure of guest OSs.

### Containers

And here we are, containers. As you may have divined, containers give us many of the security and resource-management features of VMs but without the cost of having to run a whole other operating system. It instead usings chroot, namespace, and cgroup to separate a group of processes from each other. If this sounds a little flimsy to you and you're still worried about security and resource-management, you're not alone. But I assure you a lot of very smart people have worked out the kinks and containers are the future of deploying code.

So now that we've been through why we need containers, let's go through the three things that make containers a reality.

## chroot

I've heard people call this "cha-root" and "change root". I'm going to stick to "change root" because I feel less ridiculous saying that. It's a Linux command that allows you to set the root directory of a new process. In our container use case, we just set the root directory to be where-ever the new container's new root directory should be. And now the new container group of processes can't see anything outside of it, eliminating our security problem because the new process has no visibility outside of its new root.

Let's try it. Start up a Ubuntu VM however you feel most comfortable. I'll be using Docker (and doing containers within containers 🤯). If you're like me, run `docker run -it ubuntu:latest`. This will download the [official Ubuntu container][ubuntu] from Docker Hub and grab the version marked with the _latest_ tag. In this case, _latest_ means it's the latest stable release (18.04.) You could put `ubuntu:devel` to get the latest development of Ubuntu (as of writing that'd be 19.10). `docker run` means we're going to run some commands in the container, and the `-it` means we want to make the shell interactive (so we can use it like a normal terminal.)

If you're in Windows and using WSL, just open a new WSL terminal in Ubuntu. ✌️

To see what version of Ubuntu you're using, run `cat /etc/issue/`. `cat` reads a file and dumps it into the output which means we can read it, and `/etc/issue` is a file that will tell us what distro we're using. Mine says `Ubuntu 18.04.3 LTS \n \l`.

Okay, so let's attempt to use `chroot` right now.

1. Make a new folder in your home directory via `mkdir my-new-root`.
1. Inside that new folder, run `echo "my super secret thing" >> secret.txt`.
1. Now try to run `chroot my-new-root bash` and see the error it gives you.

You should see something about failing to run a shell. That's because bash is a program and your new root wouldn't have bash to run (because it can't reach outside of its new root.) So let's fix that! Run:

1. `mkdir my-new-root/bin`
1. `cp /bin/bash /bin/ls my-new-root/bin/`
1. `chroot my-new-root bash`

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

1. `mkdir my-new-root/lib my-new-root/lib64` or you can do `my-new-root/lib{,64}` if you want to be fancy
1. Then we need to copy all those paths (ignore the lines that don't have paths) into our directory. Make sure you get the right files in the right directory. In my case above (yours likely will be different) it'd be two commands:
   1. `cp /lib/x86_64-linux-gnu/libtinfo.so.5 /lib/x86_64-linux-gnu/libdl.so.2 /lib/x86_64-linux-gnu/libc.so.6 lib`
   1. `cp /lib64/ld-linux-x86-64.so.2 lib64`
1. Do it again for `ls`. Run `ldd /bin/ls`
1. Follow the same process to copy the libraries for `ls` into our `my-new-root`.

Now, finally, run `chroot my-new-root bash` and run `ls`. You should successfully see everything in the directory. Now try `pwd` to see your working directory. You should see `/`. You can't get out of here! This, before being called containers, was called a jail for this reason. At any time, hit CTRL+D or run `exit` to get out of your chrooted environment.

Now try running `cat secret.txt`. Oh no! Your new chroot-ed environment doesn't know how to cat! As an exercise, go make `cat` work the same way we did above!

Congrats you just cha-rooted the \*\*\*\* out of your first environment!

## namespace

While chroot is a pretty straightforward, namespaces and cgroups are a bit more nebulous to understand but no less important. Both of these next two features are for security and resource management.

Let's say you're running own a big server that's in your home and you're selling space to other people (that you don't know) to run their code on your server. What sort of concerns would you have? Let's say you have Alice and Bob who are running e-commerce services dealing with lots of money. They themselves are good citizens of the servers and minding their own business. But then you have Eve join the server who has other intentions: she wants to steal money, source code, and whatever else she can get her hands on from your other tenants on the server. If just gave all three them root access to server, what's to stop Eve from taking everything? Or what if she just wants to disrupt their businesses, even if she's not stealing anything?

Your first line of defense is that you could log them into chroot'd environments and limit them to only those. Great! Now they can't see each others' files. Problem solved? Well, no, not quite yet. Despite the fact that she can't see the files, she can still see all the processes going on on the computer. She can kill processes, unmount filesystem and potentially even hijack processes.

Enter namespaces. Namespaces allow you to hide processes from other processes. If we give each chroot'd environment different sets of namespaces, now Alice, Bob, and Eve can't see each others' processes (they even get different process PIDs, or process IDs, so they can't guess what the others have) and you can't steal or hijack what you can't see!

There's a lot more depth to namespaces beyond what I've outlined here. The above is describing _just_ the UTS (or UNIX Timesharing) namespace. There are more namespaces as well and this will help these containers stay isloated from each other.

# TODO Show how to exploit a chroot'd environment

So let's create a chroot'd environment now that's isolated using namespaces using a new command: `unshare`. `unshare` creates a new isolated namespace from its parent (so you, the server provider can't spy on Bob nor Alice either) and all other future tenants. Run this:

```bash
unshare --mount --uts --ipc --net --pid --fork --user --map-root-user chroot $PWD/rootfs bash
```

This will create a new environment that's isolated on the system with its own PIDs, mounts (like storage and volumes), and network stack. Now we can't see any of the processes!

## cgroups

Okay, so now we've hidden the processes from Eve so Bob and Alice can engage in commerce in privacy and peace. So we're all good, right? They can no longer mess each other, right? Not quite. We're almost there.

So now say it's Black Friday, Boxing Day or Singles' Day (three of the biggest shopping days in the year, pick the one that makes the most sense to you 😄) and Bob and Alice are gearing up for their biggest sales day of the year. Everything is ready to go and at 9:00AM their site suddenly goes down without warning. What happened!? They log on to their chroot'd, unshare'd shell on your server and see that the CPU is pegged at 100% and there's no more memory available to allocate! Oh no! What happened?

The first explanation could be that Eve has her site running on another server and simple logged on and ran a program that ate up all the available resources so that Bob and Alice so that their sites would go down and Eve would be the only site that was up, increasing her sales.

However another, possibly more likely explanation is that both Bob's and Alice's sites got busy at the same time and that in-and-of-itself took all the resources without any malice involved, taking down their sites and everyone else on the server. Or perhaps Bob's site had a memory leak and that was enough to take all the resources available.

Suffice to say, we still have a problem. Every isolated environment has access to all _physical_ resources of the server. There's no isolation of physical components from these environments.

Enter the hero of this story: cgroups, or control groups. Google saw this same problem when building their own infrastructure and wanted to protect runaway processes from taking down entire servers and made this idea of cgroups so you can say "this isolated environment only gets so much CPU, so much memory, etc. and once it's out of those it's out-of-luck, it won't get any more."

This is a bit more difficult to accomplish but let's go ahead and give it a shot.

# TODO Clean up demo. Make it make a cgroup'd, chroot'd, unshare'd

```bash
# create new cgroups
cgcreate -g cpu,memory,blkio,devices,freezer:/sandbox

# list tasks associated to the sandbox cpu group:
cat /sys/fs/cgroup/cpu/sandbox/tasks
# show the cpu share of the sandbox cpu group:
cat /sys/fs/cgroup/cpu/sandbox/cpu.shares
# kill all of sandbox's processes
kill -9 $(cat /sys/fs/cgroup/cpu/sandbox/tasks)

# Limit usage at 10% for a multi core system
cgset -r cpu.cfs_period_us=100000 \
     -r cpu.cfs_quota_us=$[ 10000 * $(getconf _NPROCESSORS_ONLN) ] \
           sandbox

# Set a limit of 2Gb
cgset -r memory.limit_in_bytes=2G sandbox
# Get memory stats used by the cgroup
cgget -r memory.stat sandbox
```

And now we can call this a container. Using these features together, we allow Bob, Alice, and Eve to run whatever code they want and the only people they can mess with is themselves.

So while this is a container at its most basic sense, we haven't broached more advance topics like networking, deploying, bundling, or anything else that something like Docker takes care of for us. But now you know at its most base level what a container is, what it does, and how you _could_ do this yourself but you'll be grateful that Docker does it for you. On to the next lesson!

[james]: https://frontendmasters.com/courses/bash-vim-regex/
[fork-bomb]: https://en.wikipedia.org/wiki/Fork_bomb
[jem]: https://frontendmasters.com/courses/full-stack/
[ubuntu]: https://hub.docker.com/_/ubuntu
