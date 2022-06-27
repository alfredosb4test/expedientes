/* Ruta: /api/uploads */

const { Router } = require("express");  
const { body  } = require('express-validator'); 
const expressFileUpload = require('express-fileupload');
const { fileUpload, retornaArchivo, fileBorrar, getArchivos } = require("../controllers/uploads");
const { validarJWT } = require("../middlewares/validar-jwt");
const router = Router();

router.use(expressFileUpload());
router.put('/:tipo/:expe/:id_documento', [ ] , fileUpload );
router.delete('/:tipo/:expe/:id/:archivo', [ ] , fileBorrar );
router.get('/:id_documento', getArchivos );            
router.get('/:tipo/:expe/:archivo', retornaArchivo );            


module.exports = router;