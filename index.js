const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
 
// cors
app.use( cors() );

// parseo del body
app.use( express.json() ); 

// Rutas
app.use('/api/login', require('./routes/login') );
app.use('/api/categorias', require('./routes/categorias') );
app.use('/api/expedientes', require('./routes/expedientes') );
app.use('/api/documentos', require('./routes/expedientesDoc') );
app.use('/api/upload', require('./routes/uploads') );

app.listen(process.env.PORT, ()=>{
    console.log("server OK: "+process.env.PORT);
 
});