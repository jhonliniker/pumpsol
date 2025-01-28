const config = require('./src/config');
const { fetchMigratedCoins } = require('./src/api');
const {
  loadBlacklist,
  isSuspiciousCreator,
  applyFilters,
  parseCoinData,
} = require('./src/utils');
const { isBlacklisted, performSecurityChecks } = require('./src/security');
const { analyzeCoin } = require('./src/analysis');
const { setupTelegramBot, sendTelegramAlert, setCurrentlyAnalyzedContract } = require('./src/telegram');
const { saveCoin } = require('./src/coin_storage');
const db = require('./src/database');

const pollInterval = config.get('api.poll_interval');
const filters = config.get('filters');
const maxCoinsPerCreator = filters.max_coins_per_creator;

const blacklistedCoins = loadBlacklist(config, 'coin_addresses');
const blacklistedDevs = loadBlacklist(config, 'dev_addresses');

setupTelegramBot();

async function monitorCoinsLoop() {
  while (true) {
    try {
      const rawCoins = await fetchMigratedCoins(10);
      for (const rawCoin of rawCoins) {
        const parsed = parseCoinData(rawCoin);
        if (!parsed) {
          continue;
        }

        if (isBlacklisted(parsed, blacklistedCoins, blacklistedDevs)) {
          continue;
        }

        if (isSuspiciousCreator(db, parsed.creator_wallet, maxCoinsPerCreator)) {
          console.log(`[SECURITY] Creator ${parsed.creator_wallet} made too many coins.`);
          continue;
        }

        performSecurityChecks(parsed);

        if (!applyFilters(parsed, filters)) {
          continue;
        }

        saveCoin(parsed);
        analyzeCoin(parsed);

        setCurrentlyAnalyzedContract(parsed.contract_address);

        if (config.get('telegram.bot_token')) {
          const msg = `New coin found:\nSymbol: ${parsed.symbol}\nContract: ${parsed.contract_address}\nLiquidity: ${parsed.initial_liquidity}\n`;
          await sendTelegramAlert(msg);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval * 1000));
    } catch (e) {
      console.error('[ERROR]', e);
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

monitorCoinsLoop();
