const { response } = require("express"); 
const getConnection = require('../database/mssql');
 
const { generarJWT } = require("../helpers/jwt");
total = 0;
const getListMix = (req, resp = response ) =>{
  
   const pag = req.params.pag;
   $RegistrosAMostrar = parseInt(req.params.pageSize);
   if( pag ){
      $RegistrosAEmpezar = (pag-1) * $RegistrosAMostrar;
      $PagAct=pag;
   }else{
      $RegistrosAEmpezar = 0;
      $PagAct = 1;
   }
  
   $sqlCount = "SELECT count(*) as total FROM categoria_mixto";
   console.log($RegistrosAEmpezar,'|',$RegistrosAMostrar);
   getConnection.query($sqlCount)
      .then( async (rows) =>{
         total = rows[0].total;
         console.log("count", rows[0].total);
      });

   $sql = "SELECT * FROM categoria_mixto ORDER BY id_categoria_mixto ASC LIMIT ?,?";
   const result = getConnection.query($sql, [$RegistrosAEmpezar, $RegistrosAMostrar])
   .then( async (rows) => {
      if( !rows ){
         return resp.status(404).json({
            ok: false,
            msg: 'Sin registros'
         });
      }
      resp.json({ 
         ok: true,
         total,
         regsAMostrar: $RegistrosAMostrar,
         catMix: rows,
      });
   }).catch((err)=>{
      console.log('errSQL ', err)
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD (categoria_mixto).'
      });
   });
 
} 
const addCatMix = (req, resp = response ) =>{
   const { nombre, visible } = req.body;
   $sql="INSERT INTO categoria_mixto ( `nombre` , `visible` ) VALUES (?,?)";
   try{  
      const result = getConnection.query($sql, [nombre, visible])
      .then( async (rows) => {
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Sin registros'
            });
         }
         resp.json({ 
            ok: true,
            insert: rows,
         });
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   }
}


const getListLeg = (req, resp = response ) =>{
 
   const pag = req.params.pag;
   $RegistrosAMostrar = parseInt(req.params.pageSize);
   if( pag ){
    $RegistrosAEmpezar = (pag-1) * $RegistrosAMostrar;
    $PagAct=pag;
   }else{
    $RegistrosAEmpezar = 0;
    $PagAct = 1;
   }

   $sqlCount = "SELECT count(*) as total FROM categoria_legislativo";
   console.log($RegistrosAEmpezar,'|',$RegistrosAMostrar);
   getConnection.query($sqlCount)
      .then( async (rows) =>{
         total = rows[0].total;
         console.log("count", rows[0].total);
      });

   try{  
      $sql = "SELECT * FROM categoria_legislativo ORDER BY id_cl ASC LIMIT ?,?";
      const result = getConnection.query($sql, [$RegistrosAEmpezar, $RegistrosAMostrar])
      .then( async (rows) => {
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Sin registros'
            });
         }
         resp.json({ 
            ok: true,
            total,
            regsAMostrar: $RegistrosAMostrar,
            catMix: rows
         });
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   }
} 


const addCatLeg = (req, resp = response ) =>{
   const { categoria, visible } = req.body;

   $sql="INSERT INTO categoria_legislativo ( `categoria` , `activo` ) VALUES (?,?)";
   try{  
      const result = getConnection.query($sql, [categoria, visible])
      .then( async (rows) => {
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Sin registros'
            });
         }
         resp.json({ 
            ok: true,
            insert: rows,
         });
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   }
}
const editCatLeg = (req, resp = response ) =>{
   const { categoria, activo, id_cl } = req.body;

   $sql="UPDATE categoria_legislativo SET categoria=?, activo=? WHERE id_cl=?";
 
   try{  
      const result = getConnection.query($sql, [categoria, activo, id_cl])
      .then( async (rows) => {
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Sin registros'
            });
         }
         resp.json({ 
            ok: true,
            insert: rows,
         });
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   }
}

const editCatMix = (req, resp = response ) =>{
   const { nombre, visible, id_categoria_mixto } = req.body;

   $sql="UPDATE categoria_mixto SET nombre=?, visible=? WHERE id_categoria_mixto=?";
 
   try{  
      const result = getConnection.query($sql, [nombre, visible, id_categoria_mixto])
      .then( async (rows) => {
         if( !rows ){
            return resp.status(404).json({
               ok: false,
               msg: 'Sin registros'
            });
         }
         resp.json({ 
            ok: true,
            insert: rows,
         });
      });
   }catch( error ){
      return resp.status(404).json({
         ok: false,
         msg: 'error con la BD.'
      });
   }
}
const test = async( req, resp = response ) =>{
      resp.json({ 
         ok: true, 
         msg: 'test categorias ok!!'
      }); 
}
module.exports = {
   getListMix,
   addCatMix,
   getListLeg,
   addCatLeg,
   editCatLeg,
   editCatMix,
   test
}