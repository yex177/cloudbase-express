const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  database: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/wechat-cloud'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: process.env.MAX_UPLOAD_SIZE || '10mb'
  },
  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
};