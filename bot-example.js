// Telegram Bot 示例 - 处理 Inline Query
// 需要先安装: npm install node-telegram-bot-api

const TelegramBot = require('node-telegram-bot-api');

// 替换为你的 Bot Token
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
// 替换为你的 Mini App URL
const MINI_APP_URL = 'https://your-miniapp-url.com';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// 处理 /start 命令
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '👋 欢迎使用 Mini App Bot！\n\n' +
    '你可以：\n' +
    '1. 点击下方按钮打开 Mini App\n' +
    '2. 在 Mini App 中点击分享按钮\n' +
    '3. 选择要分享到的群组', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🚀 打开 Mini App',
          web_app: { url: MINI_APP_URL }
        }
      ]]
    }
  });
});

// 处理 Inline Query（用户分享时触发）
bot.on('inline_query', async (query) => {
  console.log('收到 inline query:', {
    id: query.id,
    from: query.from.username,
    query: query.query
  });

  // 准备 inline result
  const results = [
    {
      type: 'article',
      id: '1',
      title: '🎉 分享 Mini App',
      description: '点击在群组中分享这个超棒的应用',
      thumbnail_url: 'https://via.placeholder.com/150', // 可选：缩略图
      input_message_content: {
        message_text: '🚀 快来试试这个超棒的 Mini App！\n\n' +
          '点击下方按钮立即体验 👇'
      },
      reply_markup: {
        inline_keyboard: [[
          {
            text: '✨ 打开 Mini App',
            web_app: { url: MINI_APP_URL }
          }
        ]]
      }
    },
    {
      type: 'article',
      id: '2',
      title: '📱 邀请好友使用',
      description: '邀请好友一起使用 Mini App',
      thumbnail_url: 'https://via.placeholder.com/150',
      input_message_content: {
        message_text: '👋 我发现了一个很棒的 Mini App，一起来玩吧！'
      },
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎮 立即体验',
            web_app: { url: MINI_APP_URL }
          }
        ]]
      }
    }
  ];

  // 返回结果
  try {
    await bot.answerInlineQuery(query.id, results, {
      cache_time: 0, // 不缓存结果
      is_personal: true // 个性化结果
    });
    console.log('✅ Inline query 处理成功');
  } catch (error) {
    console.error('❌ Inline query 处理失败:', error);
  }
});

// 处理 chosen_inline_result（用户选择了某个结果）
bot.on('chosen_inline_result', (result) => {
  console.log('用户选择了 inline result:', {
    result_id: result.result_id,
    from: result.from.username,
    query: result.query
  });
  
  // 可以在这里记录分享统计
  // 例如：保存到数据库
});

// 错误处理
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Bot 已启动，等待消息...');
console.log('📝 请确保已在 @BotFather 中启用 Inline Mode：');
console.log('   1. 发送 /setinline 给 @BotFather');
console.log('   2. 选择你的 bot');
console.log('   3. 输入 placeholder 文本（例如：搜索...）');
