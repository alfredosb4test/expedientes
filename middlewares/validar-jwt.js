const jwt = require('jsonwebtoken');

const validarJWT = ( req, resp, next)=>{
   const token = req.header('x-token');
 
   if( !token ){
      return resp.status(404).json({
         ok: false,
         msg: 'Token no enviado'
      });
   }
   try {
      const { payload } = jwt.verify(token, process.env.JWT_SECRET);
      req.uid = payload.id;
      next();
   } catch (error) {
      return resp.status(404).json({
         ok: false,
         msg: 'token incorrecto'
      });
   }
   

}

module.exports = {
    validarJWT
}