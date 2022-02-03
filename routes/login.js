/* Ruta: /api/login */

const { Router } = require("express");
const { getLogin, renewToken, test } = require("../controllers/login");
const { validarCampos } = require("../middlewares/validar-campos");
const { body  } = require('express-validator'); 
const { validarJWT } = require("../middlewares/validar-jwt");
const router = Router();
const cors = require('cors');
router.get('/', test);
router.post('/', 
            [ 
               cors({ origin: true }),
               body('usuario', 'El email es obligatorio').not().isEmpty(),
               body('pwd', 'El password es obligatorio').not().isEmpty(),
               body('pwd', 'El password debe tener al menos 3 caracteres').isLength({ min: 3 }),
               
               validarCampos
            ] , getLogin );

router.get('/renew',
   validarJWT,
   renewToken   
)
module.exports = router;