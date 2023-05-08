# Introduction
This application runs multiple services using Docker and Docker Compose, including a **Node.js application, MySQL, and PHPMyAdmin**. The Node.js application runs on port 4000, while MySQL runs on port 8989 and PHPMyAdmin on port 8080. These ports are mapped to your local machine, so you can access PHPMyAdmin's graphical interface by visiting localhost://8080.

*you can change the ports in the docker files **(if you'd like)***

## Getting started

The main Node.js module of this application is located in `/lib/app.js`. To ensure the correct configuration of Knex, the application also imports a config.js file that must be created beforehand.

1. Edit the `.env` file to include the values for the environmental variables. For example 
```
MYSQL_HOST = library-mysql # has to be the same name as the mysql docker container
MYSQL_USER = root
MYSQL_PASSWORD = root
mysql_database = library
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

3. Run the `docker-compose` build command. (**NOTE: node_modules are installed internally in the application's docker container. Any new installed packages are added to package.json, and re-running docker-compose build)**
```bash
#!/bin/bash
docker-compose up --build
```
