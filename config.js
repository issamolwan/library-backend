import fs from 'fs'

const fbConfigPath = './keys/service_account_key.json'

const config = {
  port: process.env.PORT || 4000,
  mysql: {
    host:  process.env.MYSQL_HOST || "library-mysql",
    database:  process.env.MYSQL_DATABASE || "library",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root", 
  },
  firebase: {
    serviceAccount: (fs.existsSync(fbConfigPath) ? fbConfigPath : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  },
  redis: {
    url: process.env.REDIS_URL || "redis://redis:6379",
    socket: {
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD || "EPd1IfFaHxaLJqRVNq9igB52Ui1MdeBa"
  }

}

export { config }