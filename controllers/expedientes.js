const { log } = require("console");
const { response } = require("express"); 
const fs = require('fs');
const getConnection = require('../database/mssql');
 
const { generarJWT } = require("../helpers/jwt");
total = 0;

const insertarExpediente = (req, resp = response ) =>{

    const { numero, estatus, tramite, fraccion } = req.body;

    $insert = `INSERT INTO expediente ( numero, estatus, tramite, fraccion ) VALUES (?,?,?,?)`;
    try{  
        const result = getConnection.query($insert, [ numero, estatus, tramite, fraccion ])
        .then( async (rows) => {
            insertId = rows.insertId;
            if( !insertId ){
                return resp.status(404).json({
                    ok: false,
                    msg: 'Error al insertar.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Expediente agregado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
// regresa los expedientes a mostrar paginados para poder ver sus documentos, editar o crear
const getExpedientes = (req, resp = response ) =>{
    const pag = req.params.pag;
    $RegistrosAMostrar = parseInt(req.params.pageSize);
    if( pag ){
        $RegistrosAEmpezar = (pag-1) * $RegistrosAMostrar;
        $PagAct=pag;
    }else{
        $RegistrosAEmpezar = 0;
        $PagAct = 1;
    }
  
    $sqlCount = "SELECT count(*) as total FROM expediente";
    //console.log($RegistrosAEmpezar,'|',$RegistrosAMostrar);
    getConnection.query($sqlCount)
    .then( async (rows) =>{
        total = rows[0].total;
    });
    $sql = `SELECT id_expediente, numero FROM expediente ORDER BY id_expediente DESC LIMIT ?,?`;
    const result = getConnection.query($sql, [$RegistrosAEmpezar, $RegistrosAMostrar])
    .then( async (rows) => {
        if( !rows ){
            return resp.json({
                ok: false,
                msg: 'Sin registros'
            });
        }


        let promiseDocs = new Promise( async function(resolve, reject) {
            //rows.forEach( async function(element, index) {
            for (var indice in rows) {     
                $sqlDocs = `SELECT DATE_FORMAT(doc.entrada, '%W, %d de %M de %Y') entradaF, DATE_FORMAT(doc.aprueba, '%W, %d de %M de %Y') apruebaF, doc.* 
                FROM documento doc WHERE doc.id_expediente=${rows[indice].id_expediente}`
                await getConnection.query($sqlDocs)
                .then(  rowsDocs  =>{
                    //console.log('rowsPrim ', rowsPrim.length);
                    if( rowsDocs.length ){
                        rows[indice].docs = rowsDocs;
                    }else{
                        rows[indice].docs = { id_documento: 0 };
                    }
                    idx = parseInt(indice);
                    //console.log(rows.length + ' - ', idx +1);
                    if( rows.length == idx +1 ){
                        resolve(1);
                    }
                })
            }
        });

        Promise.race([ promiseDocs ])
        .then( res => {
            resp.json({ 
                ok: true,
                total,
                regsAMostrar: $RegistrosAMostrar,
                catExp: rows,
            });
        });
    }).catch((err)=>{
        console.log('errSQL ', err)
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD (expediente).'
        });
    });
 
}  

const getExpedientesReporte = (req, resp = response ) =>{
    console.log('-------------- getExpedientesReporte ------------------------');
    console.log( "req.query ::  ", req.query );
    let { id_categoria, legislatura, annus, asunto, periodo, tipoperiodo, desp_desch, desch, desa, fraccion, pagina } = req.query;
     
    let destino_1 = '';
    if(id_categoria!=''){
		destino_1 = ` AND id_categoria='${id_categoria}'`;
	}
	if(fraccion!=''){
		destino_1 = ` AND autor LIKE '%${fraccion}%'`;
	}

	registros = 30;
	if (!pagina) {  
        inicio = 0;     
        pagina = 1; 	 
    }
	else {    
        inicio = (pagina - 1) * registros; 
    }

    $sqlCount=`SELECT count(*) as total FROM documento INNER JOIN expediente ON documento.id_expediente=expediente.id_expediente 
    WHERE legislatura LIKE '%${legislatura}%' 
    AND annus LIKE '%${annus}%' 
    AND periodo LIKE '%${periodo}%' 
    AND tipoperiodo LIKE '%${tipoperiodo}%' 
    AND desp_desch LIKE '%${desp_desch}%' 
    AND desch LIKE '%${desch}%' 
    AND desa LIKE '%${desa}%' ${destino_1}`;
     
    //console.log($RegistrosAEmpezar,'|',$RegistrosAMostrar);
    console.log("sqlCount", $sqlCount);
    getConnection.query($sqlCount)
    .then( async (rows) =>{
        total = rows[0].total;
        $consulta_base=`SELECT *,
                DATE_FORMAT(fechadese, '%W, %d de %M de %Y') fechadeseF,
                DATE_FORMAT(entrada, '%W, %d de %M de %Y') entradaF,
                DATE_FORMAT(aprueba, '%W, %d de %M de %Y') apruebaF,
                DATE_FORMAT(fecha_concluido, '%W, %d de %M de %Y') fecha_concluidoF,
                DATE_FORMAT(fecha_DOF, '%W, %d de %M de %Y') fecha_DOFF 
            FROM documento INNER JOIN expediente ON documento.id_expediente=expediente.id_expediente 
            WHERE legislatura LIKE '%${legislatura}%' 
                AND annus LIKE '%${annus}%' 
                AND periodo LIKE '%${periodo}%' 
                AND tipoperiodo LIKE '%${tipoperiodo}%' 
                AND desp_desch LIKE '%${desp_desch}%' 
                AND desch LIKE '%${desch}%' 
                AND desa LIKE '%${desa}%' ${destino_1} LIMIT ${inicio}, ${registros}`;
    
            
        const result = getConnection.query($consulta_base, [inicio, registros])
            .then( async (rows) => {
                if( !rows ){
                    return resp.json({
                        ok: false,
                        msg: 'Sin registros'
                    });
                }
            
                resp.json({ 
                        ok: true,
                        total,
                        regsAMostrar: registros,
                        id_categoria,
                        rows
                    });
            }).catch((err)=>{
                console.log('errSQL ', err)
                return resp.status(404).json({
                    ok: false,
                    msg: 'error con la BD (expediente).'
                });
            });                
    });


}
// obtiene los datos del expediente para ser editado
const getExpediente = (req, resp = response ) =>{
    const id_expediente = req.params.id_expediente;
    console.log(id_expediente);
    $sql = "SELECT * FROM expediente WHERE id_expediente=?";
    const result = getConnection.query($sql, [id_expediente])
    .then( async (rows) => {
        if( !rows ){
            return resp.json({
            ok: false,
            msg: 'Sin registros'
            });
        }
        resp.json({ 
            ok: true,
            expediente: rows,
        });
    }).catch((err)=>{
        console.log('errSQL ', err)
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD (expediente).'
        });
    });
 
} 
// buscador header y busca-exp.component
const buscaExpediente = (req, resp = response ) =>{
    const texto = req.params.texto;
    $sql = `SELECT ex.numero, ex.id_expediente id_exp, DATE_FORMAT(doc.entrada, '%W, %d de %M de %Y') entradaF, DATE_FORMAT(doc.aprueba, '%W, %d de %M de %Y') apruebaF, doc.* 
            FROM expediente ex LEFT JOIN documento doc ON ex.id_expediente = doc.id_expediente WHERE ex.numero like '${texto}' ORDER BY id_expediente DESC`;
    const result = getConnection.query($sql, texto)
    .then( rows =>{
        if( !rows ){
            return resp.json({
            ok: false,
            msg: 'Sin registros'
            });
        }
        console.log(rows);
        resp.json({ 
            ok: true,
            catExp: rows,
        });
    }).catch((err)=>{
        console.log('errSQL ', err)
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD (expediente).'
        });
    });
}
const buscadorExpediente = (req, resp = response ) =>{
    
    const { id_categoria, legislatura, annus, asunto, periodo, tipoperiodo, desp_desch, desch, desa, fraccion, pagina } = req.body;
    let destino_1 = "";
    if(id_categoria!=''){destino_1 = ` AND id_categoria='${id_categoria}'`;}
	if(fraccion!=''){destino_1 = destino_1 + ` AND autor LIKE '%${fraccion}%'`;}

    $sql=`SELECT * FROM documento INNER JOIN expediente ON documento.id_expediente=expediente.id_expediente 
      WHERE legislatura LIKE '%${legislatura}%' AND annus LIKE '%${annus}%' AND periodo LIKE '%${periodo}%' AND tipoperiodo LIKE '%${tipoperiodo}%' 
      AND desp_desch LIKE '%${desp_desch}%' AND desch LIKE '%${desch}%' AND desa LIKE '%${desa}%' ${destino_1}`;
    console.log($sql);
    const result = getConnection.query($sql)
    .then( async (rows) => {
        if( !rows ){
            return resp.json({
                ok: false,
                msg: 'Sin registros'
            });
        }
        resp.json({ 
            ok: true,
            // total,
            // regsAMostrar: $RegistrosAMostrar,
            catExp: rows,
        });
    });
}
const editExpediente = (req, resp = response ) =>{
    const { id_expediente, numero, estatus, tramite, fraccion } = req.body;

    $update = `UPDATE expediente SET numero=?, estatus=?, tramite=?, fraccion=? WHERE id_expediente= ?`;
    try{
        const result = getConnection.query($update, [  numero, estatus, tramite, fraccion, id_expediente ])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            if( !rows.affectedRows ){
                return resp.json({
                    ok: false,
                    msg: 'Error al actualizar expediente.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Expediente actualizado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
const delExpediente = (req, resp = response ) =>{
    const id_expediente = req.params.id_expediente;
    let numero = req.params.numero; 
    numero = numero.replace(' ', '_');
    try{
        $consulta_base=`DELETE FROM expediente WHERE id_expediente=?`;
        const result = getConnection.query($consulta_base, [ id_expediente ])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            if( !rows.affectedRows ){
                return resp.json({
                    ok: false,
                    msg: 'Error al eliminar expediente.'
                });
            }
            console.log('await antes');
            let del = await delFiles( id_expediente, numero );
            console.log('del::', del);
            console.log('await despues');

            $consulta_base=`DELETE FROM documento WHERE id_expediente='${id_expediente}'`;
            getConnection.query( $consulta_base)
            .then( async(rows2) => {                                
                resp.json({ 
                    ok: true,
                    msg: 'Expediente eliminado.',
                });
            });                    
        });

    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
async function delFiles ( id_expediente, numero ){
    console.log('delFiles ::', id_expediente);
    console.log('delFiles ::', numero);
    try{
        $ids=`SELECT id_documento FROM documento WHERE id_expediente=?`;
        await getConnection.query($ids, [ id_expediente ])
        .then( async (rows) => {
            if( !rows || !rows.length ){
                console.log('rows 0');
                return false;
            }

            var result = Object.keys(rows).map((key) =>  rows[key].id_documento );
            const arr = result.join();
            console.log('ids->', arr);
            $delete=`DELETE FROM archivos WHERE id_documento IN (${arr})`;
            await getConnection.query($delete, [])
            .then( async (rows) => {
                console.log('delFiles rows affectedRows::', rows.affectedRows);
                if( !rows.affectedRows ){
                    return false;
                }
                
                const dir = `./uploads/documentos/${numero}`;
                const files = fs.readdirSync(dir) 

                for (const file of files) {
                    const path = `./uploads/documentos/${numero}/${file}`;
                    console.log('borrar::', path)
                    await fs.unlinkSync(path)
                }

                return true;
            });
        });
    }catch( error ){
        return error
    }
}
module.exports = {
    insertarExpediente,
    getExpedientes,
    getExpediente,
    buscaExpediente,
    buscadorExpediente,
    editExpediente,
    delExpediente,
    getExpedientesReporte
}