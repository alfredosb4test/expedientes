const mysql = require('mysql2/promise');
const conf = require('./confing');

async function query(sql, params) {
  const pool = await mysql.createPool(conf.db);
  const [results, ] = await pool.query(sql, params);
  pool.end();
  return results;
}

async function execute(sql) {
  const connection  = await mysql.createConnection(conf.db);
  connection.execute(sql).then( async (result) =>{
      return await result;
    });
  
}

module.exports = {
  query,
  execute
}
 