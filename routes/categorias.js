/* Ruta: /api/login */

const { Router } = require("express");
const { test, getListMix, addCatMix, getListLeg, addCatLeg, editCatLeg, editCatMix, catAutores, lstPrimeraSegComision } = require("../controllers/categorias");
const { validarCampos } = require("../middlewares/validar-campos");
const { body  } = require('express-validator'); 
const { validarJWT } = require("../middlewares/validar-jwt");
const router = Router();

router.get('/', test);
router.get('/getListMix/:pag/:pageSize', [ validarJWT ] , getListMix );
router.post('/addCatMix', [ validarJWT ] , addCatMix );
router.put('/editCatMix', [ validarJWT ] , editCatMix );
router.put('/editCatLeg', [ validarJWT ] , editCatLeg );

router.get('/getListLeg/:pag/:pageSize', [  ] , getListLeg );
router.post('/addCatLeg', [ validarJWT ] , addCatLeg );

router.get('/catAutores', [] , catAutores );
router.get('/catPrimeraSegComision', [] , lstPrimeraSegComision );

module.exports = router;