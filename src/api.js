const axios = require('axios');
const config = require('./config');

const apiBase = 'https://api.pump.fun';
const pumpfunKey = config.get('api.pumpfun_key');
const headers = {
  Authorization: `Bearer ${pumpfunKey}`,
  'Content-Type': 'application/json',
};

async function fetchMigratedCoins(limit = 100) {
  try {
    const params = {
      limit,
      sort: 'desc',
    };
    const url = `${apiBase}/migrations`;
    const resp = await axios.get(url, { headers, params, timeout: 10000 });
    resp.data.data.forEach(item => {
      if (!item.contractAddress) {
        console.warn('Missing contract address:', item);
      }
    });
    return resp.data.data || [];
  } catch (e) {
    console.error('fetch_migrated_coins error:', e);
    return [];
  }
}

module.exports = {
  fetchMigratedCoins,
};
