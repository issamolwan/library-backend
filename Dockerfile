FROM node:18.12

# Create app directory
RUN mkdir -p /app
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Install packages using Yarn
COPY . /app

ADD package.json /tmp/
RUN cd /tmp && yarn
RUN ln -s /tmp/node_modules /app

# Install nodemon for hot reload
RUN npm install -g nodemon

EXPOSE 4000

CMD nodemon lib/app.js