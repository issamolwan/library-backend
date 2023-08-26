FROM node:18.12

# Create app directory
RUN mkdir -p /app
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Copy package.json and yarn.lock to /app
COPY package.json /app/

# Install nodemon for hot reload
RUN npm install -g nodemon

# Install packages using Yarn
RUN yarn

# Copy the rest of the application
COPY . /app

EXPOSE 4000

CMD ["nodemon", "lib/app.js"]
