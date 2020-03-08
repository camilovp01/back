// Requires
const express = require('express');
const ssllabs = require('node-ssllabs');
const whois = require('whois-json');
const request = require("request");
const cheerio = require('cheerio');
const bridge = require('../business/bridge');

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

    let sslInfo = await sslInformation(domain, cache, startNew, resp);
    let prevSslInfo = await sslInformation(domain, cache = true, startNew, resp);

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

        ssl_LowestGrade = getLowestSslGrade(endpoints);
        previous_ssl_grade = getLowestSslGrade(prevSslInfo.endpoints);

        servers_changed = (ssl_LowestGrade !== previous_ssl_grade) ? true : false

        dataPage = await getDataFromPage(domain);
        for (let i = 0; i < endpoints.length; i++) {

            address = endpoints[i].ipAddress;
            ssl_grade = endpoints[i].grade;
            progress = endpoints[i].progress;

            serverInfo = await additionalInfo(address);
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

})

var sslInformation = (domain, cache, startNew, resp) => {
    let key = '';
    let val = '';
    if (cache == 'true') {
        key = 'fromCache';
        val = 'true';
    } else if (startNew === 'true') {
        key = 'startNew';
        val = 'true';
    } else if (startNew === 'false') {
        key = 'startNew';
        val = 'false';
    }
    return new Promise((resolve, reject) => {
        let options = {
            'host': domain,
            'publish': true,
            // 'startNew': true,
            // 'maxAge': "2",
            [key]: val,
            'all': "done"
        }
        ssllabs.analyze(options, (error, data) => {
            if (error) {
                resp.status(500).json({
                    error,
                    message: 'Error consumiendo servicio SSL'
                });
                reject('Error consumiendo servicio SSL', error)
            } else {
                resolve(data);
            }
        });
    })
}

var additionalInfo = async (ipAddress) => {
    let results = await whois(ipAddress, { follow: 3, verbose: true });
    return results;
}


var getDataFromPage = (domain, resp) => {

    return new Promise((resolve, reject) => {
        request('http://www.' + domain, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(html);
                let head = $.html('head');
                let loadHead = cheerio.load(head);
                let title = loadHead('title').text();
                let logo = loadHead('link[rel="shortcut icon"]').attr('href');
                logo = logo ? logo : loadHead('link[rel="icon"]').attr('href');
                resolve({
                    title,
                    logo: logo ? logo : ''
                });

            } else {
                console.log('Error obteniendo logo y titulo', error)
                resolve({
                    title: '',
                    logo: ''
                });
            }
        });
    });
}

var getLowestSslGrade = (endpoints) => {

    let lowesSslGrade = '';
    for (let i = 0; i < endpoints.length; i++) {
        lowesSslGrade = lowesSslGrade > endpoints[i].grade ? lowesSslGrade : endpoints[i].grade;
    }
    return lowesSslGrade;

}

module.exports = app;