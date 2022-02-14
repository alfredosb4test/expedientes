/* Ruta: /api/login */

const { Router } = require("express");
const { test, getListMix, addCatMix, getListLeg, addCatLeg } = require("../controllers/categorias");
const { validarCampos } = require("../middlewares/validar-campos");
const { body  } = require('express-validator'); 
const { validarJWT } = require("../middlewares/validar-jwt");
const router = Router();

router.get('/', test);
router.get('/getListMix/:pag/:pageSize', [ validarJWT ] , getListMix );
router.post('/addCatMix', [ validarJWT ] , addCatMix );
router.get('/getListLeg/:pag/:pageSize', [ validarJWT ] , getListLeg );
router.post('/addCatLeg', [ validarJWT ] , addCatLeg );

module.exports = router;