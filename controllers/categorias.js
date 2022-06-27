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
   //console.log($RegistrosAEmpezar,'|',$RegistrosAMostrar);
   getConnection.query($sqlCount)
      .then( async (rows) =>{
         total = rows[0].total;
         //console.log("count", rows[0].total);
      });

   try{  
      $sql = "SELECT * FROM categoria_legislativo ORDER BY categoria ASC LIMIT ?,?";
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
// $apellidos." ".$nombre."( $fraccion ) - ".$legislatura -AU
const catAutores = (req, resp = response ) =>{
   $sql= `SELECT CONCAT(senadores.id, '-AU') as id, CONCAT(apellidos, ' ',nombre, ' ',fraccion, ' ',legislatura) as nombre, 0 as divi, '#d4efff' as color
          FROM expediente.senadores WHERE (legislatura='64') AND tipo_puesto = 'S' AND comodin = 'N' ORDER BY apellidos ASC `;
   let legAnterior;
   let estados;
   let listLegisladores;
   const result = getConnection.query($sql)
      .then(async rows =>{
         let promiseLegAnterior = new Promise( async function(resolve, reject) {
            $sql2 = `SELECT CONCAT(senadores.id, '-AU') as id, CONCAT(apellidos, ' ',nombre, ' ',fraccion, ' ',legislatura) as nombre, 0 as divi, '#fbf494' as color
                  FROM expediente.senadores WHERE (legislatura='63') AND tipo_puesto = 'S' AND comodin = 'N' ORDER BY apellidos ASC  `
            await getConnection.query($sql2)
            .then(  rows2  =>{
               console.log('rows2 ', rows2.length);
               if( rows2.length ){
                  // legAnterior.push(rows2);
                  legAnterior=rows2;
                  resolve(1);
               }else{
                  legAnterior = {};
                  resolve(1);
               }
            })
        });
        let promiseEstados = new Promise( async function(resolve, reject) {
         $sql3 = `SELECT CONCAT(id, '-LG') as id, nombre, 0 as divi, '#ffc9b6' as color FROM expediente.estados WHERE id<>'1' AND id<>'34' ORDER BY nombre ASC `
         await getConnection.query($sql3)
         .then(  rows3  =>{
            console.log('rows3 ', rows3.length);
            if( rows3.length ){
               // legAnterior.push(rows3);
               estados=rows3;
               resolve(1);
            }else{
               estados = {};
               resolve(1);
            }
         })
     });
      Promise.all([promiseLegAnterior,promiseEstados])
        .then( res =>{ 
            listGral = [
               {  
               'id': '1001-CD',
               'nombre': 'Cámara de Diputados',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '1002-PE',
               'nombre': 'Poder Ejecutivo Federal',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '1003-MD',
               'nombre': 'Mesa Directiva',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '1004-JCP',
               'nombre': 'Junta de Coordinaci&oacute;n Política',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '1111-GP',
               'nombre': 'GPPRI',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '2222-GP',
               'nombre': 'GPPAN',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '3333-GP',
               'nombre': 'GPPRD',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '4444-GP',
               'nombre': 'GPPT',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '5555-GP',
               'nombre': 'GPPVEM',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '6666-GP',
               'nombre': 'GPMORENA',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '7777-GP',
               'nombre': 'GPMC',
               'divi': 0,
               'color': '#d8ffbb',
            },{
               'id': '8888-GP',
               'nombre': 'GPPES',
               'divi': 0,
               'color': '#d8ffbb',
            }
            ];
            divi1 = [
               {  
               'id': '0',
               'nombre': 'Senadores LXIV y LXV Legislaturas',
               'divi': 1,
               }
            ]
            
            // unir los resultados de los querys
            listLegisladores = [].concat(listGral, rows, legAnterior, estados);
            resp.json({
                ok: true, 
                listLegisladores,
            });
        });

      });
}

const lstPrimeraSegComision = (req, resp = response ) =>{
   console.log('catPrimeraSegComision');
   $sql= `SELECT id, CONCAT(nombre, ' - ', legislatura) as nombre, '#d4efff' as color FROM expediente.comisiones WHERE legislatura='64' ORDER BY nombre ASC`;
          
          
   let legAnterior; 
   let listLegisladores;
   const result = getConnection.query($sql)
      .then(async rows =>{
         let promiseLegAnterior = new Promise( async function(resolve, reject) {
            $sql2 = `SELECT id, CONCAT(nombre, ' - ', legislatura) as nombre, '#fbf494' as color FROM expediente.comisiones WHERE legislatura='63' ORDER BY nombre ASC`
            await getConnection.query($sql2)
            .then(  rows2  =>{
               console.log('rows2 ', rows2.length);
               if( rows2.length ){
                  // legAnterior.push(rows2);
                  legAnterior=rows2;
                  resolve(1);
               }else{
                  legAnterior = {};
                  resolve(1);
               }
            })
        });
 
      Promise.all([promiseLegAnterior])
        .then( res =>{  
            // unir los resultados de los querys
            listLegisladores = [].concat(rows, legAnterior);
            resp.json({
                ok: true, 
                listLegisladores,
            });
        });

      });
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
   catAutores,
   lstPrimeraSegComision,
   test
}