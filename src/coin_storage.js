const db = require('./database');

function saveCoin(parsedCoin) {
  if (!parsedCoin) {
    return;
  }
  const insertQuery = db.prepare(`
    INSERT INTO coins (
      contract_address, name, symbol, creator_wallet, migration_time,
      initial_liquidity, creator_fee, holders
    ) VALUES (
      @contract_address, @name, @symbol, @creator_wallet, @migration_time,
      @initial_liquidity, @creator_fee, @holders
    )
  `);
  insertQuery.run(parsedCoin);
}

module.exports = {
  saveCoin,
};
