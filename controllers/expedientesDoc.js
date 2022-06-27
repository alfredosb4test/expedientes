const { response } = require("express");
const getConnection = require('../database/mssql');

const { generarJWT } = require("../helpers/jwt");

const buscaExpedienteDoc =  ( req, resp = response ) =>{
    const ide = req.params.ide;
    console.log('ide', ide);
    $sql=`SELECT DATE_FORMAT(fechadese, '%W, %d de %M de %Y') fechadeseF,
    DATE_FORMAT(entrada, '%W, %d de %M de %Y') entradaF,
    DATE_FORMAT(aprueba, '%W, %d de %M de %Y') apruebaF,
    DATE_FORMAT(fecha_concluido, '%W, %d de %M de %Y') fecha_concluidoF,
    DATE_FORMAT(fecha_DOF, '%W, %d de %M de %Y') fecha_DOFF,
    CASE doc.tipoperiodo
        WHEN 1 THEN 'Ordinario'
        WHEN 2 THEN 'de Receso Comisión Permanente'
        ELSE 'Extraordinario'
    END AS tp,
    CASE doc.periodo
        WHEN 1 THEN 'Primer Periodo'
        ELSE 'Segundo Periodo'
    END AS np,
    CASE doc.legislatura
        WHEN 65 THEN 'LXV Legislatura'
        WHEN 64 THEN 'LXIV Legislatura'
        WHEN 63 THEN 'LXIII Legislatura'
        WHEN 62 THEN 'LXII Legislatura'
        WHEN 61 THEN 'LXI Legislatura'
        WHEN 60 THEN 'LX Legislatura'
        WHEN 59 THEN 'LIX Legislatura'
    END AS legislaturaF,
    CASE doc.annus
        WHEN 1 THEN 'Primer Año'
        WHEN 2 THEN 'Segundo Año'
        WHEN 3 THEN 'Tercer Año'
    END AS annusF,
    CASE doc.reforma
        WHEN '0' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Extraordinario'
    END AS reformaF,
    CASE doc.desp_desch
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS aprobado,
    CASE doc.desch
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS desechado,
    CASE doc.desa
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS concluido,
    CASE doc.urgenteyobvia
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS urgente,
    CASE doc.ejecutivo
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS ejecutivoF,
    CASE doc.cd
        WHEN '2' THEN 'NO'
        WHEN '1' THEN 'SI'
        ELSE 'Sin Selección'
    END AS cdF,
    catL.categoria, doc.*
    FROM documento doc INNER JOIN categoria_legislativo catL ON doc.id_categoria = catL.id_cl WHERE id_expediente='${ide}' ORDER BY entrada ASC `;
    // SELECT id_expediente as ide, numero FROM expediente  WHERE numero LIKE '255' ORDER BY id_expediente DESC
    const result = getConnection.query($sql)
    .then(async rows =>{
        if( !rows || !rows.length ){
            console.log('rows 0');
            return resp.json({
            ok: false,
            msg: 'Sin registros',
            expDoc: []
            });
        }
         
        let promiseProcesos = new Promise( async function(resolve, reject) {
            //rows.forEach( async function(element, index) {
            for (var indice in rows) {     
                $sqlHist = `SELECT texto, DATE_FORMAT(fecha, '%W, %d de %M de %Y') fechaF, 
                CASE tramite
                        WHEN 1 THEN 'RECTIFICACIÓN DE TURNO'
                        WHEN 2 THEN 'TRÁMITE INICIAL'
                        WHEN 3 THEN 'PRIMERA LECTURA'
                        WHEN 4 THEN 'SEGUNDA LECTURA'
                        WHEN 5 THEN 'DICTAMINACIÓN CONJUNTA'
                        WHEN 6 THEN 'MOCIÓN SUSPENSIVA'
                        WHEN 7 THEN 'FUNDAMENTACIÓN DEL DICTAMEN'
                        WHEN 8 THEN 'POSICIONAMIENTO DE LOS GRUPOS PARLAMENTARIOS'
                        WHEN 9 THEN 'DISCUSIÓN GENERAL'
                        WHEN 10 THEN 'DISCUSIÓN PARTICULAR'
                        WHEN 11 THEN 'EFECTOS DE LA DISCUSIÓN'
                        WHEN 12 THEN 'SITUACIÓN EN CÁMARA DE DIPUTADOS'
                        WHEN 13 THEN 'PODER EJECUTIVO FEDERAL'
                        WHEN 14 THEN 'LEGISLATURAS ESTATALES'
                        WHEN 15 THEN 'COMISIONES'
                        WHEN 16 THEN 'PUBLICADO EN EL DIARIO OFICIAL'
                        WHEN 17 THEN 'DISCUSIÓN'
                        WHEN 18 THEN 'SEGUIMIENTO'
                        WHEN 19 THEN 'URGENTE RESOLUCIÓN'
                        WHEN 20 THEN 'AMPLIACIÓN DE PLAZO'
                        WHEN 21 THEN 'EXCITATIVA'
                        WHEN 22 THEN 'TEXTO APROBADO'
                        WHEN 23 THEN 'ACUERDO DE LA JUNTA DE COORDINACIÓN POLÍTICA'
                        WHEN 24 THEN 'ACUERDO DE LA MESA DIRECTIVA'
                        WHEN 25 THEN 'COMUNICACIÓN'
                        WHEN 26 THEN 'PROYECTO DE DECLARATORIA'
                        WHEN 27 THEN 'ESCRUTINIO'
                        WHEN 28 THEN 'DECLARATORIA DE APROBACIÓN'
                        WHEN 29 THEN 'EFECTOS DE LA DECLARATORIA'
                        WHEN 30 THEN 'ARTÍCULO 219 DEL REGLAMENTO DEL SENADO'
                        WHEN 31 THEN 'CONCLUIDO'
                        WHEN 32 THEN 'RETIRADO'
                        ELSE         'RESPUESTA'
                    END as tramiteF
                    FROM historial WHERE historial.id_documento = ${rows[indice].id_documento} AND historial.id_expediente =  ${rows[indice].id_expediente} `
                await getConnection.query($sqlHist)
                .then(  rowsHisto  =>{
                    //console.log('rowsHisto ', rowsHisto.length);
                    if( rowsHisto.length ){
                        rows[indice].procesos = rowsHisto;
                    }else{
                        rows[indice].procesos = {};
                    }
                    idx = parseInt(indice);
                    //console.log(rows.length + ' - ', idx +1);
                    if( rows.length == idx +1 ){
                        resolve(1);
                    }
                })
            }
        });
        let promisePrimera = new Promise( async function(resolve, reject) {
            //rows.forEach( async function(element, index) {
            for (var indice in rows) {     
                $sqlPrim = `SELECT id_anexo AS primera FROM contenedor_anexo WHERE id_docto='${rows[indice].id_documento}' AND tipo='1C'`
                await getConnection.query($sqlPrim)
                .then(  rowsPrim  =>{
                    //console.log('rowsPrim ', rowsPrim.length);
                    if( rowsPrim.length ){
                        rows[indice].primera = rowsPrim;
                    }else{
                        rows[indice].primera = {};
                    }
                    idx = parseInt(indice);
                    //console.log(rows.length + ' - ', idx +1);
                    if( rows.length == idx +1 ){
                        resolve(1);
                    }
                })
            }
        });
        let promiseSegunda = new Promise( async function(resolve, reject) {
            //rows.forEach( async function(element, index) {
            for (var indice in rows) {     
                $sqlPrim = `SELECT id_anexo AS segunda FROM contenedor_anexo WHERE id_docto='${rows[indice].id_documento}' AND tipo='CU'`
                await getConnection.query($sqlPrim)
                .then(  rowsPrim  =>{
                    //console.log('rowsPrim ', rowsPrim.length);
                    if( rowsPrim.length ){
                        rows[indice].segunda = rowsPrim;
                    }else{
                        rows[indice].segunda = {};
                    }
                    idx = parseInt(indice);
                    //console.log(rows.length + ' - ', idx +1);
                    if( rows.length == idx +1 ){
                        resolve(1);
                    }
                })
            }
        });
        
        // let promiseFiles = new Promise( async function(resolve, reject) {
        //     for (var indice in rows) {   
        //         $sqlFiles=`SELECT * FROM archivos WHERE id_documento='${rows[indice].id_documento}' ORDER BY id DESC`;
        //         await getConnection.query($sqlFiles)
        //         .then(  rowsFile  =>{
        //             //console.log('rowsFile ', rowsFile.length);
        //             if( rowsFile.length ){
        //                 rows[indice].files = rowsFile;
        //             }else{
        //                 rows[indice].files = {};
        //             }
        //             idx = parseInt(indice);
        //             //console.log(rows.length + ' - ', idx +1);
        //             if( rows.length == idx +1 ){
        //                 resolve(1);
        //             }
        //         })
        //     }
        // }); 
        
        Promise.all([ promiseProcesos, promisePrimera, promiseSegunda ])
        .then( res => {
            
            txt_fechadese = rows[0].fechadese.toISOString();
            txt_entrada = rows[0].entrada.toISOString();
            txt_aprueba = rows[0].aprueba.toISOString();
            txt_fecha_concluido = rows[0].fecha_concluido.toISOString();
            txt_fecha_DOF = rows[0].fecha_DOF.toISOString();
            if ( txt_fechadese.indexOf('1899') >= 0 ) rows[0].fechadese = '';
            if ( txt_entrada.indexOf('1899') >= 0 ) rows[0].entrada = '';
            if ( txt_aprueba.indexOf('1899') >= 0 ) rows[0].aprueba = '';
            if ( txt_fecha_concluido.indexOf('1899') >= 0 ) rows[0].fecha_concluido = '';
            if ( txt_fecha_DOF.indexOf('1899') >= 0 ) rows[0].fecha_DOF = '';
            
            resp.json({
                ok: true,
                expDoc: rows,
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

const dof = ( req, resp = response )=>{
    const id_documento = req.body.id_documento;  
    $sql=`SELECT * FROM documento WHERE id_documento='${id_documento}' ORDER BY id_documento ASC`;
    const result = getConnection.query($sql)
    .then( rows =>{
        if( !rows ){
            return resp.json({
            ok: false,
            msg: 'Sin registros'
            });
        }
        resp.json({ 
            ok: true,
            dof: rows,
        });
    }).catch((err)=>{
        console.log('errSQL ', err)
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD (expediente).'
        });
    });
}

const insertDoc = ( req, resp = response )=>{
    
    const id_expediente = req.body.id_expediente
    const id_categoria = req.body.id_categoria
    const legislatura = req.body.legislatura
    const annus = req.body.annus
    const periodo = req.body.periodo
    const tipoperiodo = req.body.tipoperiodo
    const desp_desch = req.body.desp_desch
    const urgenteyobvia = req.body.urgenteyobvia
    const enterado = req.body.enterado
    const asunto = req.body.asunto
    const entrada = req.body.entrada
    const aprueba = req.body.aprueba
    const observaprueba = req.body.observaprueba
    const autor = req.body.autor
    const turno = req.body.turno
    const notas = req.body.notas
    const id_mixto = req.body.id_mixto
    const ejecutivo = req.body.ejecutivo
    const cd = req.body.cd
    const observaciones = req.body.observaciones
    const desch = req.body.desch
    const desa = req.body.desa
    const fechadese = req.body.fechadese
    const refe = req.body.refe
    const TA = req.body.TA
    const EA = req.body.EA
    const reforma = req.body.reforma
    const sinopsis = req.body.sinopsis
    const fecha_concluido = req.body.fecha_concluido
    const fecha_DOF = req.body.fecha_DOF
    const DOF = req.body.DOF
    const id_gaceta = req.body.id_gaceta
    const d_debates = req.body.d_debates
    const suscritos = req.body.suscritos
    const primera = req.body.primera
    const segunda = req.body.segunda
    console.log("req.body ", req.body);
    $insert = `INSERT INTO documento ( 
    id_expediente ,
    id_categoria ,
    legislatura ,
    annus ,
    periodo ,
    tipoperiodo ,
    desp_desch ,
    urgenteyobvia ,
    enterado ,
    asunto ,
    entrada ,
    aprueba ,
    observaprueba ,
    autor ,
    turno ,
    notas ,
    id_mixto ,
    ejecutivo ,
    cd ,
    observaciones ,
    desch ,
    desa ,
    fechadese ,
    refe ,
    TA ,
    EA ,
    reforma ,
    sinopsis, 
    fecha_concluido,
    fecha_DOF,
    DOF ,
    id_gaceta ,
    d_debates ,
    suscritos )
   VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    
        console.log("sql insert", $insert);
    //Object.keys(req.body.entrada).length
    const aprueba2 = req.body.aprueba ? req.body.aprueba.year + '-' + req.body.aprueba.month + '-' + req.body.aprueba.day : '0000-00-00';
    const fecha_concluido2 = req.body.fecha_concluido ? req.body.fecha_concluido.year + '-' + req.body.fecha_concluido.month + '-' + req.body.fecha_concluido.day : '0000-00-00';
    const fechadese2 = req.body.fechadese ? req.body.fechadese.year + '-' + req.body.fechadese.month + '-' + req.body.fechadese.day : '0000-00-00';
    const entrada2 = req.body.entrada ? req.body.entrada.year + '-' + req.body.entrada.month + '-' + req.body.entrada.day : '0000-00-00';
    const fecha_DOF2 = req.body.fecha_DOF ? req.body.fecha_DOF.year + '-' + req.body.fecha_DOF.month + '-' + req.body.fecha_DOF.day : '0000-00-00';
     
    try{  
        let insertId;
        const result = getConnection.query($insert, [ id_expediente, id_categoria, legislatura, annus, periodo, tipoperiodo, desp_desch, urgenteyobvia, enterado, asunto, entrada2, aprueba2, observaprueba, autor, turno, notas, id_mixto, ejecutivo, cd, observaciones, desch, desa, fechadese2, refe, TA, EA, reforma, sinopsis, fecha_concluido2, fecha_DOF2, DOF, id_gaceta, d_debates, suscritos])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            console.log('rows insertId::', rows.insertId);
            insertId = rows.insertId;
            if( !insertId ){
                return resp.json({
                    ok: false,
                    msg: 'Error al insertar documento.'
                });
            }
            if (Object.keys(req.body.senadores).length) {
                await fn_senadores( req.body.senadores, insertId )
                    .then( resp => console.log(resp) )  
            }
            if( req.body.primera != "" ){
                await fn_primera( req.body.primera, insertId )
                    .then( resp => console.log(resp) )                
            }
            if (Object.keys(req.body.segunda).length) {
                await fn_segunda( req.body.segunda, insertId )
                    .then( resp => console.log(resp) )                
            }
            resp.json({ 
                ok: true,
                msg: 'Documento agregado.',
            });
            
            
        });
     }catch( error ){
        return resp.status(404).json({
           ok: false,
           msg: 'error con la BD.'
        });
     }

}
const editDoc = ( req, resp = response )=>{
    
    const id_expediente = req.body.id_expediente
    const id_documento = req.body.id_documento
    const id_categoria = req.body.id_categoria
    const legislatura = req.body.legislatura
    const annus = req.body.annus
    const periodo = req.body.periodo
    const tipoperiodo = req.body.tipoperiodo
    const desp_desch = req.body.desp_desch
    const urgenteyobvia = req.body.urgenteyobvia
    const enterado = req.body.enterado
    const asunto = req.body.asunto
    const entrada = req.body.entrada
    const aprueba = req.body.aprueba
    const observaprueba = req.body.observaprueba
    const autor = req.body.autor
    const turno = req.body.turno
    const notas = req.body.notas
    const id_mixto = req.body.id_mixto
    const ejecutivo = req.body.ejecutivo
    const cd = req.body.cd
    const observaciones = req.body.observaciones
    const desch = req.body.desch
    const desa = req.body.desa
    const fechadese = req.body.fechadese
    const refe = req.body.refe
    const TA = req.body.TA
    const EA = req.body.EA
    const reforma = req.body.reforma
    const sinopsis = req.body.sinopsis
    const fecha_concluido = req.body.fecha_concluido
    const fecha_DOF = req.body.fecha_DOF
    const DOF = req.body.DOF
    const id_gaceta = req.body.id_gaceta
    const d_debates = req.body.d_debates
    const suscritos = req.body.suscritos
    const primera = req.body.primera
    const segunda = req.body.segunda

    const aprueba2 = req.body.aprueba ? req.body.aprueba.year + '-' + req.body.aprueba.month + '-' + req.body.aprueba.day : '0000-00-00';
    const fecha_concluido2 = req.body.fecha_concluido ? req.body.fecha_concluido.year + '-' + req.body.fecha_concluido.month + '-' + req.body.fecha_concluido.day : '0000-00-00';
    const fechadese2 = req.body.fechadese ? req.body.fechadese.year + '-' + req.body.fechadese.month + '-' + req.body.fechadese.day : '0000-00-00';
    const entrada2 = req.body.entrada ? req.body.entrada.year + '-' + req.body.entrada.month + '-' + req.body.entrada.day : '0000-00-00';
    const fecha_DOF2 = req.body.fecha_DOF ? req.body.fecha_DOF.year + '-' + req.body.fecha_DOF.month + '-' + req.body.fecha_DOF.day : '0000-00-00';
     
    
    $update = `UPDATE documento SET
        id_categoria = ? ,
        legislatura = ? ,
        annus = ? ,
        periodo = ? ,
        tipoperiodo = ? ,
        desp_desch = ? ,
        urgenteyobvia = ? ,
        enterado = ? ,
        asunto = ? ,
        entrada = ? ,
        aprueba = ? ,
        observaprueba = ? ,
        autor = ? ,
        turno = ? ,
        notas = ? ,
        id_mixto = ? ,
        ejecutivo = ? ,
        cd = ? ,
        observaciones = ? ,
        desch = ? ,
        desa = ? ,
        fechadese = ? ,
        refe = ? ,
        TA = ? ,
        EA = ? ,
        reforma = ? ,
        sinopsis = ?, 
        fecha_concluido = ?,
        fecha_DOF = ?,
        DOF = ? ,
        id_gaceta = ? ,
        d_debates = ? ,
        suscritos = ? 
        WHERE id_documento= ?
        `;
        try{
            const result = getConnection.query($update, [ id_categoria, legislatura, annus, periodo, tipoperiodo, desp_desch, urgenteyobvia, enterado, asunto, entrada2, aprueba2, observaprueba, autor, turno, notas, id_mixto, ejecutivo, cd, observaciones, desch, desa, fechadese2, refe, TA, EA, reforma, sinopsis, fecha_concluido2, fecha_DOF2, DOF, id_gaceta, d_debates, suscritos, id_documento])
            .then( async (rows) => {
                console.log('rows affectedRows::', rows.affectedRows);
                if( !rows.affectedRows ){
                    return resp.json({
                        ok: false,
                        msg: 'Error al actualizar documento.'
                    });
                }

                $consulta_base=`DELETE FROM contenedor_anexo WHERE id_docto='${id_documento}'`;
                getConnection.query( $consulta_base)
                .then( async(rows) => {      
                    console.log('senadores length::', Object.keys(req.body.senadores).length);              
                    if (Object.keys(req.body.senadores).length) {
                        await fn_senadores( req.body.senadores, id_documento )
                            .then( resp => console.log(resp) )  
                    }
                    if( req.body.primera != "" ){
                        await fn_primera( req.body.primera, id_documento )
                            .then( resp => console.log(resp) )                
                    }
                    if (Object.keys(req.body.segunda).length) {
                        await fn_segunda( req.body.segunda, id_documento )
                            .then( resp => console.log(resp) )                
                    }

                    resp.json({ 
                        ok: true,
                        msg: 'Documento actualizado.',
                    });

                });
            })
        }catch( error ){
            return resp.status(404).json({
               ok: false,
               msg: 'error con la BD.'
            });
         }

}
const duplicaDoc = ( req, resp = response )=>{
    const id_documento = req.params.id_documento;
    try{  
        $sql = `INSERT INTO documento(id_documento, id_expediente, id_categoria,  legislatura,  annus,  periodo,  tipoperiodo,  desp_desch,  urgenteyobvia,  enterado,  asunto,  entrada,  aprueba,  observaprueba,  autor,  turno,  id_mixto,  ejecutivo,  cd,  observaciones,  desch,  desa, fecha_concluido,  fechadese,  refe,  TA,  EA,  reforma,  sinopsis,  fecha_DOF,  DOF, suscritos ) 
        SELECT '', id_expediente, id_categoria,  legislatura,  annus,  periodo,  tipoperiodo,  desp_desch,  urgenteyobvia,  enterado,  asunto,  entrada,  aprueba,  observaprueba,  autor,  turno,  id_mixto,  ejecutivo,  cd,  observaciones,  desch,  desa, fecha_concluido,  fechadese,  refe,  TA,  EA,  reforma,  sinopsis,  fecha_DOF,  DOF, suscritos 
        FROM documento WHERE id_documento=${id_documento}`;
        const result = getConnection.query($sql, [ id_documento])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            console.log('rows insertId::', rows.insertId);
            insertId = rows.insertId;
            if( !insertId ){
                return resp.json({
                    ok: false,
                    msg: 'Error al insertar documento.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Documento duplicado.',
            });            
        });
     }catch( error ){
        return resp.status(404).json({
           ok: false,
           msg: 'error con la BD.'
        });
     }
}
const getSenadoresSelect = ( req, resp = response )=>{
    const id_docto = req.params.id_docto;
    $sql = `SELECT CONCAT(id_anexo,'-',tipo) id, 0 divi, '#d8ffbb' color, id_docto, tipo, id_anexo, '' apellidos, 'Cámara de Diputados' nombre, '' fraccion FROM expediente.contenedor_anexo WHERE id_docto='${id_docto}' AND tipo='CD' UNION
    SELECT CONCAT(id_anexo,'-',tipo) id, 0 divi, '#d8ffbb' color, id_docto, tipo, id_anexo, '' apellidos, CASE id_anexo
                    WHEN '1111' THEN 'GPPRI'
                    WHEN '2222' THEN 'GPPAN'
                    WHEN '3333' THEN 'GPPRD'
                    WHEN '4444' THEN 'GPPT'
                    WHEN '5555' THEN 'GPPVEM'
                    WHEN '6666' THEN 'GPMORENA'
                    WHEN '7777' THEN 'GPMC'
                    WHEN '8888' THEN 'GPPES'
            ELSE 'GP'
        END AS nombre, '' fraccion FROM expediente.contenedor_anexo WHERE id_docto='${id_docto}' AND tipo='GP' UNION
    SELECT CONCAT(id_anexo,'-',tipo) id, 0 divi, '#d8ffbb' color, id_docto, tipo, id_anexo, '' apellidos, 'Poder Ejecutivo Federal' nombre, '' fraccion FROM expediente.contenedor_anexo WHERE id_docto='${id_docto}' AND tipo='PE' UNION
    SELECT CONCAT(id_anexo,'-',tipo) id, 0 divi, '#d8ffbb' color, id_docto, tipo, id_anexo, '' apellidos, 'Mesa Directiva' nombre, '' fraccion FROM expediente.contenedor_anexo WHERE id_docto='${id_docto}' AND tipo='MD' UNION
    SELECT CONCAT(id_anexo,'-',tipo) id, 0 divi, '#d8ffbb' color, id_docto, tipo, id_anexo, '' apellidos, 'Junta de Coordinación Política' nombre, '' fraccion FROM expediente.contenedor_anexo WHERE id_docto='${id_docto}' AND tipo='JCP' 
    UNION
    SELECT CONCAT(ca.id_anexo,'-',ca.tipo) id, 0 divi, '#d4efff' color, ca.id_docto, ca.tipo, ca.id_anexo, sen.apellidos, sen.nombre, sen.fraccion FROM expediente.contenedor_anexo ca INNER JOIN expediente.senadores sen ON ca.id_anexo = sen.id WHERE ca.id_docto='${id_docto}' AND ca.tipo='AU'  
    UNION
    SELECT CONCAT(ca.id_anexo,'-',ca.tipo) id, 0 divi, '#ffc9b6' color, ca.id_docto, ca.tipo, ca.id_anexo, '' apellidos, estados.nombre, '' fraccion FROM expediente.contenedor_anexo ca INNER JOIN expediente.estados ON ca.id_anexo = estados.id WHERE ca.id_docto='${id_docto}' AND ca.tipo='LG'  `;
    console.log($sql);
    const result = getConnection.query($sql)
    .then(async rows =>{
        if( !rows || !rows.length ){
            console.log('rows 0');
            return resp.json({
            ok: false,
            msg: 'Sin registros.'
            });
        }
        resp.json({
            ok: true,
            senadores: rows,
        });
    });
}
const getProcesosLeg = ( req, resp = response )=>{
    const id_documento = req.params.id_documento;
    const id_expediente = req.params.id_expediente;
    $sql = `SELECT id, tramite, texto, DATE_FORMAT(fecha, '%W, %d de %M de %Y') fechaF, DATE_FORMAT(fecha, '%Y-%m-%d') fecha,
    CASE tramite
        WHEN 1 THEN 'RECTIFICACIÓN DE TURNO'
        WHEN 2 THEN 'TRÁMITE INICIAL'
        WHEN 3 THEN 'PRIMERA LECTURA'
        WHEN 4 THEN 'SEGUNDA LECTURA'
        WHEN 5 THEN 'DICTAMINACIÓN CONJUNTA'
        WHEN 6 THEN 'MOCIÓN SUSPENSIVA'
        WHEN 7 THEN 'FUNDAMENTACIÓN DEL DICTAMEN'
        WHEN 8 THEN 'POSICIONAMIENTO DE LOS GRUPOS PARLAMENTARIOS'
        WHEN 9 THEN 'DISCUSIÓN GENERAL'
        WHEN 10 THEN 'DISCUSIÓN PARTICULAR'
        WHEN 11 THEN 'EFECTOS DE LA DISCUSIÓN'
        WHEN 12 THEN 'SITUACIÓN EN CÁMARA DE DIPUTADOS'
        WHEN 13 THEN 'PODER EJECUTIVO FEDERAL'
        WHEN 14 THEN 'LEGISLATURAS ESTATALES'
        WHEN 15 THEN 'COMISIONES'
        WHEN 16 THEN 'PUBLICADO EN EL DIARIO OFICIAL'
        WHEN 17 THEN 'DISCUSIÓN'
        WHEN 18 THEN 'SEGUIMIENTO'
        WHEN 19 THEN 'URGENTE RESOLUCIÓN'
        WHEN 20 THEN 'AMPLIACIÓN DE PLAZO'
        WHEN 21 THEN 'EXCITATIVA'
        WHEN 22 THEN 'TEXTO APROBADO'
        WHEN 23 THEN 'ACUERDO DE LA JUNTA DE COORDINACIÓN POLÍTICA'
        WHEN 24 THEN 'ACUERDO DE LA MESA DIRECTIVA'
        WHEN 25 THEN 'COMUNICACIÓN'
        WHEN 26 THEN 'PROYECTO DE DECLARATORIA'
        WHEN 27 THEN 'ESCRUTINIO'
        WHEN 28 THEN 'DECLARATORIA DE APROBACIÓN'
        WHEN 29 THEN 'EFECTOS DE LA DECLARATORIA'
        WHEN 30 THEN 'ARTÍCULO 219 DEL REGLAMENTO DEL SENADO'
        WHEN 31 THEN 'CONCLUIDO'
        WHEN 32 THEN 'RETIRADO'
        ELSE         'RESPUESTA'
    END as tramiteF
    FROM historial WHERE historial.id_documento = ${id_documento} AND historial.id_expediente =  ${id_expediente} `
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
            procesos: rows,
        });
    });
}
async function fn_senadores ( senadores, insertId ){
    return new Promise( async(resolve, reject) =>{
        let arr_senadores = [];
        senadores.forEach( senador => {
            sen = senador.id.split('-');
            arr =   [ 
                        insertId,
                        sen[1],
                        sen[0]
                    ]
            arr_senadores.push(arr);
        });
        console.log( 'arr_senadores ',  arr_senadores );

        $consulta_base=`INSERT INTO contenedor_anexo (id_docto, tipo, id_anexo) VALUES ?;`;
        await getConnection.query( $consulta_base, [arr_senadores])
        .then( async (rows2) => {
            if( !rows2.affectedRows ){
                reject('Error al insertar senadores.');
            } 
            resolve('Senadores agregados');               
        });
    });
}
async function fn_primera ( primera, insertId ){
    return new Promise( async(resolve, reject) =>{
        $consulta_base=`INSERT INTO contenedor_anexo VALUES ('','${insertId}','1C','${primera}')`;
        await getConnection.query( $consulta_base)
        .then( (rows3) => {
            if( !rows3.affectedRows ){
                reject('Error al insertar primera comision.');
            }
            resolve('Primera comision agregado');
        });
    });
}
async function fn_segunda ( segunda, insertId ){
    return new Promise( async(resolve, reject) =>{
        let arr_segunda = [];
        segunda.forEach( segunda => { 
            arr =   [ 
                        insertId,
                        'CU',
                        segunda
                    ]
                    arr_segunda.push(arr);
        });
        $consulta_base=`INSERT INTO contenedor_anexo (id_docto, tipo, id_anexo) VALUES ?;`;
        await getConnection.query( $consulta_base, [arr_segunda])
                .then( async (rows2) => {
                    if( !rows2.affectedRows ){
                        reject('Error al insertar segunda comision.');
                    } 
                    resolve('Segunda comision agregado');               
                });
    });
}
const insertHistorial = ( req, resp = response )=>{

    const { id_expediente, id_documento, proTramite, proTexto, profFecha } = req.body;
    const fecha = profFecha ? profFecha.year + '-' + profFecha.month + '-' + profFecha.day : '0000-00-00';
    $insert = `INSERT INTO historial (id_expediente,id_documento,tramite,texto,fecha) VALUES (?,?,?,?,?)`;
    try{  
        const result = getConnection.query($insert, [ id_expediente, id_documento, proTramite, proTexto, fecha ])
        .then( async (rows) => {
            insertId = rows.insertId;
            if( !insertId ){
                return resp.json({
                    ok: false,
                    msg: 'Error al insertar.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Proceso Legislativo agregado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
const editHistorial = ( req, resp = response )=>{
    const { id, tramite, texto, fecha } = req.body;

    const fechaF = req.body.fecha ? req.body.fecha.year + '-' + req.body.fecha.month + '-' + req.body.fecha.day : '0000-00-00';
    $update = `UPDATE historial SET fecha=?, tramite=?, texto=? WHERE id= ?`;
    try{
        const result = getConnection.query($update, [ fechaF, tramite, texto, id ])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            if( !rows.affectedRows ){
                return resp.json({
                    ok: false,
                    msg: 'Error al actualizar documento.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Proceso Legislativo actualizado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD2.'
        });
    }
}
const delHistorial = ( req, resp = response )=>{
    console.log( req.params );
    const id = req.params.id;
    $consulta_base=`DELETE FROM historial WHERE id='${id}'`;
    try{
        const result = getConnection.query($consulta_base, [ id ])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            if( !rows.affectedRows ){
                return resp.json({
                    ok: false,
                    msg: 'Error al eliminar documento.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Proceso Legislativo eliminado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
const delDocumento = ( req, resp = response )=>{
    console.log( req.params );
    const id = req.params.id;
    $consulta_base=`DELETE FROM documento WHERE id_documento='${id}'`;
    try{
        const result = getConnection.query($consulta_base, [ id ])
        .then( async (rows) => {
            console.log('rows affectedRows::', rows.affectedRows);
            if( !rows.affectedRows ){
                return resp.json({
                    ok: false,
                    msg: 'Error al eliminar documento.'
                });
            }
            resp.json({ 
                ok: true,
                msg: 'Documento eliminado.',
            });
        });
    }catch( error ){
        return resp.status(404).json({
            ok: false,
            msg: 'error con la BD.'
        });
    }
}
module.exports = {
    buscaExpedienteDoc,
    dof,
    insertDoc,
    editDoc,
    duplicaDoc,
    getSenadoresSelect,
    getProcesosLeg,
    insertHistorial,
    editHistorial,
    delHistorial,
    delDocumento
}