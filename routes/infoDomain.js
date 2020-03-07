// Requires
const express = require('express');
const ssllabs = require('node-ssllabs');
const whois = require('whois-json');
const request = require("request");
const cheerio = require('cheerio');

const app = express();

app.get('/', async (req, resp) => {

    let domain = req.query.domain;

    let sslInfo = await sslInformation(domain);
    let endpoints = sslInfo.endpoints;
    let servers = [];
    let address = '';
    let ssl_grade = '';
    let country = '';
    let owner = '';
    let dataPage = {}

    if (endpoints) {
        dataPage = await getDataFromPage(domain);
        for (let i = 0; i < endpoints.length; i++) {

            address = endpoints[i].ipAddress;
            ssl_grade = endpoints[i].grade;

            serverInfo = await additionalInfo(address);
            country = serverInfo[0].data.country;
            owner = serverInfo[0].data.orgName;

            servers = [
                ...servers,
                {
                    address,
                    ssl_grade,
                    country,
                    owner
                }
            ];
        }

        resp.status(200).json({
            servers,
            servers_changed: '',
            ssl_grade: '',
            previous_ssl_grade: '',
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

var sslInformation = (domain) => {
    return new Promise((resolve, reject) => {
        ssllabs.analyze({
            "host": domain,
            "publish": true,
            "startNew": true,
            "all": "done"
        }, (err, data) => {
            if (err) {
                reject('Error consumiendo servicio SSL', err)
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


var getDataFromPage = (domain) => {

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
                console.log(error);
                reject('error obteniendo logo y titulo', error);
            }
        });
    });

}

module.exports = app;