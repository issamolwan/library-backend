FROM node:18.12

# Create app directory
RUN mkdir -p /app
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV


ADD package.json /app

RUN yarn

# Install packages using Yarn
COPY . /app

RUN ln -s ./node_modules /app/node_modules

# Install nodemon for hot reload
RUN npm install -g nodemon

EXPOSE 4000

CMD nodemon ./lib/app.js