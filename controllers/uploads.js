
const { response } = require("express"); 
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs'); 
 
const getConnection = require('../database/mssql');

const fileBorrar = (req, resp = response ) =>{
   const tipo = req.params.tipo; 
   let expe = req.params.expe; 
   expe = expe.replace(' ', '_');
   const id = req.params.id; 
   const archivo = req.params.archivo; 
   try{  
      $sql=`DELETE FROM archivos WHERE id = ?`;
      console.log($sql);
      const result = getConnection.query($sql, [ id ])
      .then( async (rows) => {
         if( rows.affectedRows){
            const path = `./uploads/${tipo}/${expe}/${archivo}`;
            fs.unlinkSync(path)
            resp.json({ 
               ok: true,
               msg: 'Archivo eliminado',
            });
         }else{
            resp.json({ 
               ok: false,
               msg: 'sin documento',
            });
         }
         
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   } 
 
}
const fileUpload = (req, resp = response ) =>{
   const tipo = req.params.tipo; 
   let expe = req.params.expe; 
   expe = expe.replace(' ', '_');
   let id_documento = req.params.id_documento; 
   // console.log(req.params);
   // console.log(req.files);
   if (!req.files || Object.keys(req.files).length === 0) {
         return resp.json({ok: false, msg: 'No existe un archivo'});
   }
   try {
      const file = req.files.imagen;
      const nombreCortado = file.name.split('.');
      const extension = nombreCortado[ nombreCortado.length -1 ];
      // validar ext
      const extensionesValidas = ['jpg', 'png', 'jpeg', 'pdf'];
      if( !extensionesValidas.includes( extension.toLowerCase() ) ){
         return resp.json({ 
            ok: false,
            msg: 'Extension no permitida '
         });
      }
      
      let nombreArchivo = `${ nombreCortado[0] }.${ extension }`;
      nombreArchivo = nombreArchivo.replace(' ', '_');
       
      if( !fs.existsSync(`./uploads/${tipo}/${expe}/`) ) 
         fs.mkdirSync(`./uploads/${tipo}/${expe}/`,{recursive:false});
   
 
      if( fs.existsSync(`./uploads/${tipo}/${expe}/${nombreArchivo}`) ){
         resp.json({ 
            ok: false,
            msg: 'Archivo existente',
            nombreArchivo,
         });
         return;
      }
      
      try{  
         $sql=`INSERT INTO archivos (id_documento , archivo) VALUES (?,?)`;
         console.log($sql);
         const result = getConnection.query($sql, [id_documento, nombreArchivo])
         .then( async (rows) => {
            const path = `./uploads/${tipo}/${expe}/${nombreArchivo}`;
            file.mv( path, (err) =>{
               if (err){
                  return resp.status(500).json({
                     ok: false,
                     msg: 'Error al copiar el archivo'
                  });
               }
               resp.json({ 
                  ok: true,
                  msg: 'Archivo guardado',
                  nombreArchivo,
                  insert: rows,
               });
            });
         });
      }catch( error ){
         return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
         });
      } 
   } catch (error) {
      resp.json({ 
         ok: false,
         msg: error
      });
   }
}

const getArchivos = (req, resp = response ) =>{
   const id_documento = req.params.id_documento;
   const id_expediente = req.params.id_expediente;
   $sql = `SELECT * FROM archivos WHERE id_documento = ${id_documento} `
   console.log($sql);
   const result = getConnection.query($sql)
   .then(async rows =>{
       if( !rows || !rows.length ){
           return resp.json({
           ok: false,
           msg: 'Sin registros.'
           });
       }
       resp.json({
           ok: true,
           archivos: rows,
       });
   });
}

const retornaArchivo = (req, res = response) =>{
   const tipo = req.params.tipo; 
   const numero = req.params.expe; 
   const archivo = req.params.archivo; 
   
   const pathImg = path.join( __dirname, `../uploads/${tipo}/${numero}/${archivo}` );

   if( fs.existsSync( pathImg) ){
      res.sendFile(pathImg);
   }else{
      const pathImg = path.join( __dirname, `../uploads/imagen-no-disponible.png` );
      res.sendFile( pathImg );
   }
   

}

module.exports = {
   fileUpload,
   fileBorrar,
   getArchivos,
   retornaArchivo,
}