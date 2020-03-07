// Requires
var express = require('express');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

// parse application/json
app.use(bodyParser.json());

//importar rutas
var appRoutes = require('./routes/app');

//Rutas
app.use('/', appRoutes);


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server running on port 3000:\x1b[32m%s\x1b[0m', ' online');
})