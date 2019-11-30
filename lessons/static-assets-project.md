---
title: "Static Assets Project"
path: "/static-assets-project"
order: 7
---

We're going to do a project now! Free to attempt the project first and then follow along with me as I code the answer.

We're going to construct a very basic front end website with React, TypeScript, and Sass. Why these? Because I want it to have a lot of dependencies and a big build step. This class isn't about any of these things (and I don't personally endorse the use of Sass anymore though I respect those who do.) If you want to take a class on React, my [intro][intro] and [intermediate][intermediate] classes are available on Frontend Masters.

We're going to create a new project using [create-react-app][cra]. Go to the directory where you want to create the new project (CRA will create the folder for you) and run `npm create react-app static-app --typescript`. This will scaffold out a whole new TypeScript React project for you. Go into the project and run `npm install node-sass`. This will install the Sass compiler for you. Go change both of the `.css` files in this project to have the `.scss` extensions (everything that's valid in CSS is valid in SCSS.) Update the two `.css` imports in `App.tsx` and `index.tsx` to have `.scss imports instead. If you're struggling with the Sass stuff, feel free to leave it out and just go with an out-of-the-box CRA app, the Sass stuff is just to drive home the point that you can have as many dependencies as you want.

To make sure this works right now, run `npm run start` in your console and make sure the app starts okay. You should see a splash screen. Once you're ready to build it, run `npm run build` to have it build for production.

The project is to make a multi-stage Dockerfile that build the project in one container and then serves it from a different container using NGINX. If you're not familiar with NGINX, fear not! It is a static file server, which is to say it take takes HTML, CSS, JS, images, fonts, etc. and serves them to your users. It handles all the serving and file headers for you. Using it can be accomplished in few steps. You'll use the `nginx:latest` (or `nginx:alpine`! up to you) container and copy **just the newly built files, not everything** (which is in the `build` directory inside of the CRA app) to `/usr/share/nginx/html` and the `nginx` will take care of the rest. The `nginx` container defines `CMD` in it and if you don't override it, it starts NGINX for you. Give it a shot! Once you've tried, come back here and we'll do the solution together. NGINX runs on port 80 by default, so you probably want to route that something like 8080 on your host machine (otherwise you have to run it as root which no one wants to do.)

<div style="height: 600px"></div>

Done? If you gave it a shot, your Dockerfile probably shouldn't very long. Let's see what I came up with

```Dockerfile
FROM node:latest
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# you could totally use nginx:alpine here too
FROM nginx:latest
COPY --from=0 /app/build /usr/share/nginx/html
```

Now if you run this, it should work:

```bash
docker build -t static-app .
docker run -p 8080:80 static-app
```

It should be working now! Hooray! Hopefully you're starting to see the power of what Docker can unlock for you.

[intro]: https://frontendmasters.com/courses/complete-react-v5/
[intermediate]: https://frontendmasters.com/courses/intermediate-react-v2/
[cra]: https://create-react-app.dev
