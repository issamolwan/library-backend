# Introduction
The application acts as a convenient virtual library where users can keep track of their ongoing book reading. It allows users to easily add the books they are currently reading, update their progress by noting the current page, and share their personal reviews. To make book management even more enjoyable, the application integrates with an external API to automatically fetch book covers based on the book titles provided. With these features, users can stay organized and engaged in their reading adventures.

The application runs multiple services using Docker and Docker Compose; a **Node.js application, MySQL, PHPMyAdmin and Redis**. The Node.js application runs on port 4000, while MySQL runs on port 8989, PHPMyAdmin on port 8080 and Redis on port 6379. These ports are mapped to your local machine, so you can access PHPMyAdmin's graphical interface by visiting localhost://8080.

*you can change the ports in the docker files **(if you'd like)***

## Note
This application now requires Firebase integration using a service account. To access the application's full functionality, you need to possess the necessary credentials.

## Project Structure 
- migrations - migration files to create or change database structure
- lib/app.js - starter file to create the server and main point of the application
- lib/workflow/index.js - main application middleware
- lib/workflow/schema.js - schema to validate incoming requests
- lib/models - database models to directly access database tables
- lib/utils - utilities for handling errors and accessibility options to application
- tests - integration tests for models and API.

## Getting started

The main Node.js module of this application is located in `/lib/app.js`. To ensure the correct configuration of Knex, the application also imports a config.js file that must be created beforehand.

1. Edit the `.env` file to include the values for the environmental variables. For example 
```
MYSQL_HOST = library-mysql # has to be the same name as the mysql docker container
MYSQL_USER = root
MYSQL_PASSWORD = root
MYSQL_DATABASE = library
MYSQL_PORT = 3306 # mysql's docker container port is 3306
MYSQL_ROOT_PASSWORD = root
```

2. Create a `config.js` file in the base of the app's directory
```
config = {
  port: process.env.PORT || 4000,
  mysql: {
    host:  process.env.MYSQL_HOST || "library-mysql",
    database:  process.env.MYSQL_DATABASE || "library",
    user: "root" ,
    password: "root" ,
    port: 3306
  }
}

export { config }
```

3. Run the `docker-compose` build command.  Or `docker compose` depending on your version of docker compose (**NOTE: The node_modules directory is installed within the application's Docker container. Any new packages that are installed are added to the package.json file, and then the Docker-compose build command is run again)**
```bash
#!/bin/bash
docker-compose up --build
```
# Running tests
In order to run the tests in `tests` directory, you have to bash into the node application's docker container. Example 
```bash
#!/bin/bash
docker-compose docker exec -it library_backend bash
```
then
```bash
#!/bin/bash
npm run test
```
