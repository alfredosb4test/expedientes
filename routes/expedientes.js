const { Router } = require("express");
const { getExpedientes, buscaExpediente, editExpediente, getExpediente, insertarExpediente, delExpediente, buscadorExpediente, getExpedientesReporte } = require("../controllers/expedientes");
const { validarCampos } = require("../middlewares/validar-campos");
const { body  } = require('express-validator'); 
const { validarJWT } = require("../middlewares/validar-jwt");
const router = Router();
 
router.get('/getExpedientes/:pag/:pageSize', [  ] , getExpedientes );
router.get('/getExpediente/:id_expediente', [  ] , getExpediente );
router.get('/buscaExpediente/:texto', [  ] , buscaExpediente );
router.get('/buscadorExpediente/', [  ] , buscadorExpediente );
router.get('/getExpedientesReporte/', [  ] , getExpedientesReporte );
router.put('/editExpediente', [  ] , editExpediente );
router.post('/insertarExpediente', [  ] , insertarExpediente );
router.delete('/delExpediente/:id_expediente/:numero', [  ] , delExpediente );
module.exports = router; 