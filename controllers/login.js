const { response } = require("express"); 
const getConnection = require('../database/mssql');
const { base64encode } = require('nodejs-base64');
const { generarJWT } = require("../helpers/jwt");

const getLogin = async (req, resp = response ) =>{

    const { usuario, pwd } = req.body; 

   try{ 
      let decoded = base64encode(pwd);
      const pool = await getConnection();
      const result = await pool.request().query(`select * from cusuario where usuario='${usuario}' AND contrasena = '${decoded}'`)
      .then( async result => {
         const { recordset } = result;

         if( !result.rowsAffected[0] ){
            return resp.status(404).json({
               ok: false,
               msg: 'Usuario no encontrado'
            })
         }
 
         const token = await generarJWT( { 
            id: result.recordset[0].usuarioid,
            usuario: result.recordset[0].usuario,
         })
         console.log( token );
         result.recordset[0].contrasena = '???';
         resp.json({ 
            ok: true,
            usuario: result.recordset[0],
            token
         });
      });
      
   }catch( error ){
      console.log(error);
   }
} 


const renewToken = async( req, resp = response ) =>{
   const uid = req.uid; 

   const pool = await getConnection();
   console.log('renewToken', uid);
   const result = await pool.request().query(`select * from cusuario where usuarioid='${uid}' `)
   .then( async result => {
      const { recordset } = result;

      if( !result.rowsAffected[0] ){
         return resp.status(404).json({
            ok: false,
            msg: 'Usuario no encontrado'
         })
      }
      // delete result.recordset[0].contrasena;
      result.recordset[0].contrasena = '???';
      //console.log( result.recordset[0].usuarioid );
      const token = await generarJWT( { 
         id: result.recordset[0].usuarioid,
         usuario: result.recordset[0].usuario,
      })
      
      resp.json({ 
         ok: true,
         usuario: result.recordset[0],
         token
      });
   });

 
}
const test = async( req, resp = response ) =>{
   const rows = await getConnection.query('select * from usuarios');
   resp.json({ 
      ok: true,
      users: rows,
      msg: 'test ok!!'
   });
}
module.exports = {
   getLogin,
   renewToken,
   test
}