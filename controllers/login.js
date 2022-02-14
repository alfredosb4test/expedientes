const { response } = require("express"); 
const getConnection = require('../database/mssql');
var md5 = require('md5');
const { generarJWT } = require("../helpers/jwt");

const getLogin = (req, resp = response ) =>{

   const { usuario, pwd } = req.body;  
   const pwwdMD5 = md5(pwd); 
   try{  
      $sql = `select * from usuarios where usuario=? AND clave = ?`;
      const result = getConnection.query($sql, [usuario, pwwdMD5])
      .then( async ([rows,fields]) => {
         console.log('row:',rows);
         console.log('fields:',fields);
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Usuario no encontrado'
            })
         }
 
         const token = await generarJWT( { 
            id: rows.id,
            usuario: rows.usuario,
            n_acceso: rows.n_acceso,
         });
     
         console.log( token );
         rows.clave = '???';
         resp.json({ 
            ok: true,
            usuario: rows,
            token
         });
          

      });
   }catch( error ){
      console.log(error);
   }
} 


const renewToken = async( req, resp = response ) =>{
   const id = req.id; 
 
   console.log('renewToken', id);
   const result = await getConnection.query(`select * from usuarios where id=${id} `)
   .then( async ([rows,fields]) => {

      if( !rows ){
         return resp.status(404).json({
            ok: false,
            msg: 'error con el token'
         });
      }
      // delete result.recordset[0].contrasena;
      rows.clave = '???';
      //console.log( result.recordset[0].usuarioid );
      const token = await generarJWT( { 
         id: rows.id,
         usuario: rows.usuario,
         n_acceso: rows.n_acceso,
      });
      
      resp.json({ 
         ok: true,
         usuario: rows,
         token
      });
   });

 
}
const test = async( req, resp = response ) =>{
   const rows = await getConnection.query('select * from usuarios where id=? AND n_acceso=?', [8,5])
   .then( (rows) => { 
      resp.json({ 
         ok: true,
         users: rows,
         msg: 'test ok!!'
      });
   }).catch( err=>{ 
      return resp.status(404).json({
         ok: false,
         msg: 'error con la DB.'
      });
   });
    
}
module.exports = {
   getLogin,
   renewToken,
   test
}