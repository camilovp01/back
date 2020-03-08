const configDB = require('./configDB');
const Pool = require('pg').Pool;

const pool = new Pool(configDB);

const getSearchHistory = async () => {
    return await pool.query('SELECT * FROM search_history_d');
}

const insertHistory = async (domain) => {
    return await pool.query('INSERT INTO search_history_d (name_sh) VALUES ($1)', [domain]);
}

module.exports = {
    getSearchHistory,
    insertHistory
}