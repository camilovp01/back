var express = require('express');

var app = express();

app.get('/', (req, resp, next) => {
    resp.status(200).json({
        ok: true,
        mensaje: 'Servicio en linea 🌟'
    });
});

module.exports = app;