// Requires
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Api de Verificación SSL de Dominios",
            description: "Api para consultar dominios",
            contact: {
                name: "API Support"
            },
            servers: 'http://localhost:3000',
            version: "1.0.0"
        }
    },
    apis: ['./routes/*.js']
}


//Inicializar variables
var app = express();

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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