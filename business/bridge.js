const query = require('../database/queries');

const getSearchHistory = async () => {
    return await query.getSearchHistory();
}

const insertHistory = async (domain) => {
    return await query.insertHistory(domain);
}

module.exports = {
    getSearchHistory,
    insertHistory
}
