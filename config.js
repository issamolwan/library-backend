import fs from 'fs'

const fbConfigPath = './keys/service_account_key.json'

const config = {
  port: process.env.PORT || 4000,
  mysql: {
    host:  process.env.MYSQL_HOST || "library-mysql",
    database:  process.env.MYSQL_DATABASE || "library",
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD, 
  },
  firebase: {
    serviceAccount: (fs.existsSync(fbConfigPath) ? fbConfigPath : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }
}

export { config }