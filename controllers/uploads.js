
const { response } = require("express"); 
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const { getConnection } = require('../database/mssql');
const { pool } = require("mssql");

const fileUpload = (req, resp = response ) =>{
 
   const tipo = req.params.tipo; 
   const id = req.params.id; 
   console.log(req.files);
   if (!req.files || Object.keys(req.files).length === 0) {
         return resp.json({ok: false, msg: 'No existe un archivo'});
   }
   try {
      const file = req.files.imagen;

      const nombreCortado = file.name.split('.');
      const extension = nombreCortado[ nombreCortado.length -1 ];
      console.log(extension);
      // validar ext
      const extensionesValidas = ['jpg', 'png', 'jpeg'];

      if( !extensionesValidas.includes( extension ) ){
         return resp.json({ 
            ok: false,
            msg: 'Extension no permitida '
         });
      }
      // generar nombre unico
      const nombreArchivo = `${ uuidv4() }.${ extension }`;

      //path
      const path = `./uploads/${tipo}/${nombreArchivo}`;

      file.mv( path, (err) =>{
         if (err)
           return resp.status(500).json({
              ok: false,
              msg: 'Error al copiar la imagen'
           });
     
         resp.json({ 
            ok: true,
            msg: 'Archivo subido',
            nombreArchivo
         });
       });

     
   } catch (error) {
      resp.json({ 
         ok: false,
         msg: error
      });
   }
}

const retornaImagen = (req, res = response) =>{
   const tipo = req.params.tipo; 
   const foto = req.params.foto; 
   
   const pathImg = path.join( __dirname, `../uploads/${tipo}/${foto}` );

   if( fs.existsSync( pathImg) ){
      res.sendFile(pathImg);
   }else{
      const pathImg = path.join( __dirname, `../uploads/imagen-no-disponible.png` );
      res.sendFile( pathImg );
   }
   

}

module.exports = {
   fileUpload,
   retornaImagen
}