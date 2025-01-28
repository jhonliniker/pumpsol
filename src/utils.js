const { Web3 } = require('web3');
const _ = require('lodash');

function loadBlacklist(config, key) {
  const addressesStr = config.get(`blacklists.${key}`, '');
  const addresses = addressesStr.split(',').map(addr => addr.trim()).filter(addr => addr);
  const checksummed = new Set();
  for (const addr of addresses) {
    try {
      checksummed.add(Web3.utils.toChecksumAddress(addr));
    } catch (e) {
      // Skip invalid addresses
    }
  }
  return checksummed;
}

function isSuspiciousCreator(db, creatorWallet, maxCoinsPerCreator) {
  const query = `
    SELECT COUNT(*) as created_coins 
    FROM coins 
    WHERE creator_wallet = ?
  `;
  const result = db.prepare(query).get(creatorWallet);
  return result && result.created_coins > maxCoinsPerCreator;
}

function applyFilters(coinData, filters) {
  if (!coinData) {
    return false;
  }

  const { min_liquidity, max_creator_fee, min_holders, block_new_coins_minutes } = filters;
  const { initial_liquidity, creator_fee, holders, migration_time } = coinData;

  if (initial_liquidity < min_liquidity) return false;
  if (creator_fee > max_creator_fee) return false;
  if (holders < min_holders) return false;

  const ageThreshold = new Date(Date.now() - block_new_coins_minutes * 60 * 1000);
  if (new Date(migration_time) > ageThreshold) return false;

  return true;
}

function parseCoinData(raw_data) {
  try {
    const contract_address = Web3.utils.toChecksumAddress(raw_data.contractAddress);
    const name = _.get(raw_data, 'token.name', 'Unknown');
    const symbol = _.get(raw_data, 'token.symbol', 'UNK');
    const creator = _.get(raw_data, 'creator', '0x0000000000000000000000000000000000000000');
    const creator_wallet = Web3.utils.toChecksumAddress(creator);
    const migration_time = raw_data.migrationTime;
    const initial_liquidity = parseFloat(raw_data.initialLiquidity || 0);
    const creator_fee = parseFloat(raw_data.feePercentage || 0);
    const holders = parseInt(raw_data.holderCount || 0);

    return {
      contract_address,
      name,
      symbol,
      creator_wallet,
      migration_time,
      initial_liquidity,
      creator_fee,
      holders,
    };
  } catch (e) {
    console.error('Error parsing coin data:', e);
    return null;
  }
}

module.exports = {
  loadBlacklist,
  isSuspiciousCreator,
  applyFilters,
  parseCoinData
};
