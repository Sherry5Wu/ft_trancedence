# install node docker image
FROM node:20-slim

# we will be working in 'app' directory inside docker
WORKDIR /app

# copy package.json and package-lock.json (that have all the dependencies) to the working directory
# dependencies include: react, react-dom, typescript, tailwindcss, postcss (so tailwind works), vite (so typescript works)
COPY package.json package-lock.json ./

# install node package manager
RUN npm install

# copy everything else
COPY . .

# give permission to execute entrypoint script
RUN chmod +x /entrypoint.sh

# expose a port for the app to run
EXPOSE 9000

# run the entrypoint script
CMD sh /app/entrypoint.sh