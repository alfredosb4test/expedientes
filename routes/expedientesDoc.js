const { Router } = require("express");
const { validarCampos } = require("../middlewares/validar-campos");
const { body  } = require('express-validator'); 
const { validarJWT } = require("../middlewares/validar-jwt");
const { buscaExpedienteDoc, dof, insertDoc, editDoc, getSenadoresSelect, insertHistorial, editHistorial, getProcesosLeg, delHistorial, delDocumento, duplicaDoc } = require("../controllers/expedientesDoc");
const router = Router();
 
router.get('/buscaDoc/:ide', [  ] , buscaExpedienteDoc );
router.get('/DOF', [  ] , dof );
router.post('/insertDoc', [  ] , insertDoc );
router.put('/editDoc', [  ] , editDoc );
router.post('/duplicaDoc/:id_documento', [  ] , duplicaDoc );
router.get('/getSenadoresSelect/:id_docto', [  ] , getSenadoresSelect );
router.get('/getProcesosLeg/:id_documento/:id_expediente', [  ] , getProcesosLeg );
router.post('/insertHistorial', [  ] , insertHistorial );
router.put('/editHistorial', [  ] , editHistorial );
router.delete('/delHistorial/:id', [  ] , delHistorial );
router.delete('/delDocumento/:id', [  ] , delDocumento );
module.exports = router;