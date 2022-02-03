
require('dotenv').config();
 
const conf = {
  db: {
    host: process.env.servidor,
    user: process.env.userDB,
    password: process.env.password,
    database: process.env.database,
  },
  listPerPage: 10,
};
 
module.exports = conf;
