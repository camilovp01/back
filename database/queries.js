const configDB = require('./configDB');
const Pool = require('pg').Pool;

const pool = new Pool(configDB);

const getSearchHistory = async () => {
    return await pool.query('SELECT name_sh FROM search_history_d ORDER BY date_sh DESC');
}

const insertHistory = async (domain) => {
    return await pool.query('INSERT INTO search_history_d (name_sh, date_sh) VALUES ($1, current_timestamp())', [domain]);
}

module.exports = {
    getSearchHistory,
    insertHistory
}