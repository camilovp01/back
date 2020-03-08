// Requires
const express = require('express');
const bridge = require('../business/bridge');
const util = require('../utils/utils');

const app = express();

app.get('/gethistory', async (req, resp) => {
    let history = await bridge.getSearchHistory();
    resp.status(200).json({
        items: history.rows
    });
});

app.post('/saveHistory', async (req, respo) => {
    let domain = req.body.domain;
    let result = await bridge.insertHistory(domain);
    respo.status(200).json({
        rowCount: result.rowCount
    });
});

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