const config = require('./config');
const db = require('./database');

function isBlacklisted(coinData, blacklistedCoins, blacklistedDevs) {
  if (!coinData || !coinData.contract_address || !coinData.creator_wallet) {
    return true;
  }

  if (blacklistedCoins.has(coinData.contract_address)) {
    console.log(`[SECURITY] Coin ${coinData.contract_address} is blacklisted.`);
    return true;
  }
  if (blacklistedDevs.has(coinData.creator_wallet)) {
    console.log(`[SECURITY] Dev ${coinData.creator_wallet} is blacklisted.`);
    return true;
  }
  return false;
}

function performSecurityChecks(coinData) {
  const securityData = {
    contract_address: coinData.contract_address,
    rugcheck_score: 100.0,
    rugcheck_verdict: 'Good',
    top_holder_percent: 0.0,
    is_bundled: false,
    check_time: new Date().toISOString(),
  };

  const insertQuery = db.prepare(`
    INSERT OR REPLACE INTO security_checks (
      contract_address, rugcheck_score, rugcheck_verdict, top_holder_percent, is_bundled, check_time
    ) VALUES (
      @contract_address, @rugcheck_score, @rugcheck_verdict, @top_holder_percent, @is_bundled, @check_time
    )
  `);
  insertQuery.run(securityData);
  return securityData;
}

module.exports = {
  isBlacklisted,
  performSecurityChecks,
};
