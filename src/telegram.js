const { Telegraf } = require('telegraf');
const config = require('./config');

let bot = null;
const telegramToken = config.get('telegram.bot_token');
const telegramChannelId = config.get('telegram.channel_id');

function setupTelegramBot() {
  if (!telegramToken) {
    console.log('[TELEGRAM] No bot token provided. Telegram bot is disabled.');
    return;
  }
  bot = new Telegraf(telegramToken);
  bot.start((ctx) => ctx.reply(
    'Welcome to PumpFun Bot!\n' +
    'Commands:\n' +
    '/buy [amount] - Execute a mock buy.\n' +
    '/sell [amount] - Execute a mock sell.\n'
  ));
  bot.command('buy', (ctx) => {
    const amount = parseFloat(ctx.message.text.split(' ')[1] || 0.1);
    ctx.reply(`Buying ${amount} of ${currentlyAnalyzedContract} (mock)...`);
  });
  bot.command('sell', (ctx) => {
    const amount = parseFloat(ctx.message.text.split(' ')[1] || 0.1);
    ctx.reply(`Selling ${amount} of ${currentlyAnalyzedContract} (mock)...`);
  });
  bot.on('text', (ctx) => {
    ctx.reply('Use /buy or /sell commands, or /start for help.');
  });
  bot.launch();
  console.log('[TELEGRAM] Telegram bot started.');
}

async function sendTelegramAlert(message) {
  if (!telegramChannelId) {
    console.log('[TELEGRAM] No CHANNEL_ID configured.');
    return;
  }
  if (!bot) {
    console.log('[TELEGRAM] Telegram bot is not initialized.');
    return;
  }
  try {
    await bot.telegram.sendMessage(telegramChannelId, message);
  } catch (e) {
    console.error('[TELEGRAM] Error sending message:', e);
  }
}

let currentlyAnalyzedContract = null;

function setCurrentlyAnalyzedContract(contract) {
  currentlyAnalyzedContract = contract;
}

module.exports = {
  setupTelegramBot,
  sendTelegramAlert,
  setCurrentlyAnalyzedContract,
};
