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

app.listen(process.env.PORT, ()=>{
    console.log("server OK: "+process.env.PORT);
 
});