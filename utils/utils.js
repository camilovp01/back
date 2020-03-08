const ssllabs = require('node-ssllabs');
const whois = require('whois-json');
const request = require("request");
const cheerio = require('cheerio');

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

module.exports = {
    sslInformation,
    additionalInfo,
    getDataFromPage,
    getLowestSslGrade
}