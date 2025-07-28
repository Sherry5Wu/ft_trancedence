# install node docker image
FROM node:20-slim

# we will be working in 'app' directory inside docker
WORKDIR /app

# copy package.json and package-lock.json (that have all the dependencies) to the working directory
# dependencies inside include: typescript, tailwindcss (both mandatory),
# react, react-dom (for hooks, virtual DOMS, etc.),
# postcss (so tailwind works), and vite (to run the dev server and to make typescript work with browsers)
COPY package.json package-lock.json .

# install node package manager
RUN npm install

# copy everything else
COPY . .

# give permission to execute entrypoint script
RUN chmod +x entrypoint.sh

# expose a port for the app to run
EXPOSE 9000

# run the entrypoint script
CMD ["sh", "/app/entrypoint.sh"]

# INSTRUCTIONS TO USE
# - to build docker:                docker build --no-cache -t frontend .
# - to run docker:                  docker run -p 9000:9000 -v $(pwd):/app frontend
#   or                              docker run -p 9000:9000 frontend
#                                   (this  won't overwrite the container's /app,
#                                   if you're not doing live editing, just replace -v with -p)
# - to stop docker          
#   first get the id:               docker ps (to get the id)
#   then:                           docker stop {id}
# - or stop all containers with:    docker stop $(docker ps -q)

# in the project root:              npm install react-router-dom 
#                                   npm install --save-dev @types/react-router-dom
