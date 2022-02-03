const mysql = require('mysql2/promise');
const conf = require('./confing');

async function query(sql, params) {
  const connection = await mysql.createConnection(conf.db);
  const [results, ] = await connection.execute(sql, params);
  return results;
}

module.exports = {
  query
}
 