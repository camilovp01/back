// Requires
const express = require('express');
const bridge = require('../business/bridge');
const util = require('../utils/utils');

const app = express();

/**
 * @swagger
 * /infodomain/gethistory:
 *   get:
 *     summary: Retorna una lista de dominios consultados
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Lista retornada correctamente
 *         schema:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               name_sh:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *               example:
 *                 - name_sh: ejemplo.com
 *                 - name_sh: ejemplo.com
 * 
*/
app.get('/gethistory', async (req, resp) => {
    let history = await bridge.getSearchHistory();
    resp.status(200).json({
        items: history.rows
    });
});

/**
 * @swagger
 * /infodomain/saveHistory:
 *   post:
 *     summary: Guarda el nombre del dominio buscado
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         type: object
 *         schema:
 *           type: object
 *           properties:
 *             domain:
 *               type: string 
 *     responses:
 *       200:
 *         description: Filas insertadas
 *         schema:
 *           type: object
 *           properties:
 *             rowCount:
 *               type: number
 *           example:
 *             rowCount: 1
*/
app.post('/saveHistory', async (req, respo) => {
    let domain = req.body.domain;
    let result = await bridge.insertHistory(domain);
    respo.status(200).json({
        rowCount: result.rowCount
    });
});


/**
 * @swagger
 * /infodomain:
 *   get:
 *     summary: Consulta información de dominio
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: query
 *        name: domain
 *        required: true
 *        description: Nombre el dominio
 *      - in: query
 *        name: cache
 *        required: true
 *        description: true o false
 *      - in: query
 *        name: startNew
 *        required: true
 *        description: true o false
 *     responses:
 *       200:
 *         description: Lista de datos SSL e información de dominio
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             servers:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   ssl_grade:
 *                     type: string
 *                   country:
 *                     type: string
 *                   owner:
 *                     type: string
 *                   progress:
 *                     type: integer
 *             servers_changed:
 *               type: boolean
 *             ssl_grade:
 *               type: string
 *             previous_ssl_grade:
 *               type: string
 *             logo:
 *               type: string
 *             title:
 *               type: string
 *             is_down:
 *               type: boolean
 * 
 */
app.get('/', async (req, resp) => {

    let domain = req.query.domain;
    let cache = req.query.cache;
    let startNew = req.query.startNew;

    let sslInfo = await util.sslInformation(domain, cache, startNew, resp);
    let prevSslInfo = await util.sslInformation(domain, cache = true, startNew, resp);

    let endpoints = sslInfo.endpoints;
    let servers = [];
    let address = '';
    let ssl_grade = '';
    let country = '';
    let owner = '';
    let dataPage = {}
    let progress = 0;

    let ssl_LowestGrade;
    let previous_ssl_grade;
    let servers_changed;

    if (endpoints) {

        ssl_LowestGrade = util.getLowestSslGrade(endpoints);
        previous_ssl_grade = util.getLowestSslGrade(prevSslInfo.endpoints);

        servers_changed = (ssl_LowestGrade !== previous_ssl_grade) ? true : false

        dataPage = await util.getDataFromPage(domain);
        for (let i = 0; i < endpoints.length; i++) {

            address = endpoints[i].ipAddress;
            ssl_grade = endpoints[i].grade;
            progress = endpoints[i].progress;

            serverInfo = await util.additionalInfo(address);
            country = serverInfo[0].data.country;
            owner = serverInfo[0].data.orgName;

            servers = [
                ...servers,
                {
                    address,
                    ssl_grade,
                    country,
                    owner,
                    progress
                }
            ];
        }

        resp.status(200).json({
            status: sslInfo.status,
            servers,
            servers_changed,
            ssl_grade: ssl_LowestGrade,
            previous_ssl_grade,
            ...dataPage,
            is_down: false,

        });

    } else {
        resp.status(200).json({
            servers,
            servers_changed: '',
            ssl_grade: '',
            previous_ssl_grade: '',
            logo: '',
            title: '',
            is_down: true,

        });
    }

});

module.exports = app;