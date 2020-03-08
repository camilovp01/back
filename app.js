// Requires
var express = require('express');
var bodyParser = require('body-parser');

//Inicializar variables
var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    next();
});
// parse application/json
app.use(bodyParser.json());

//importar rutas
var appRoutes = require('./routes/app');
var infoDomain = require('./routes/infoDomain');

//Rutas
app.use('/', appRoutes);
app.use('/infodomain', infoDomain);



//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server running on port 3000:\x1b[32m%s\x1b[0m', ' online');
})