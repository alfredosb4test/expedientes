const jwt = require('jsonwebtoken');
require('dotenv').config();

const generarJWT = ( payload ) => {


   return new Promise ((resolve, reject) => {
      const datos = {
         payload
      };
      jwt.sign( datos, process.env.JWT_SECRET, {
         expiresIn: '4h'
      }, (err, token) =>{
         if(err){
            reject('Error al generar token');
         }else{
            resolve( token );
         }
         
      } )
   } );
}

module.exports = {
   generarJWT
}