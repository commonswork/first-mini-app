# Telegram Mini App 群组分享指南

## 问题描述

需要让用户分享 Mini App 到任意群组，并在其他人从群组打开时，能够识别是从哪个群组打开的。

## 解决方案

**不需要获取用户的群组列表！** Telegram 提供了内置机制：

### 核心概念

1. **`chat_instance`** - 群组上下文的唯一标识符
   - 当用户从群组中打开 Mini App 时，Telegram 会自动提供这个参数
   - 每个群组都有唯一的 `chat_instance`
   - 可以通过 `initDataUnsafe.chat_instance` 获取

2. **`switchInlineQuery()`** - 分享方法
   - 让用户选择要分享到的聊天
   - 不需要提前知道用户有哪些群组
   - Telegram 会自动显示聊天选择界面

## 实现步骤

### 1. 在 Bot 中启用 Inline Mode

首先需要在 BotFather 中启用 inline mode：

```
/setinline
选择你的 bot
输入 placeholder 文本（例如：搜索...）
```

### 2. Bot 后端处理 Inline Query

当用户选择群组后，Bot 需要返回 inline result：

```javascript
// 使用 node-telegram-bot-api 示例
bot.on('inline_query', async (query) => {
  const results = [{
    type: 'article',
    id: '1',
    title: '分享 Mini App',
    description: '点击在群组中分享',
    input_message_content: {
      message_text: '🎉 快来试试这个超棒的 Mini App！'
    },
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🚀 打开 Mini App',
          web_app: { url: 'https://your-miniapp-url.com' }
        }
      ]]
    }
  }];

  await bot.answerInlineQuery(query.id, results, {
    cache_time: 0
  });
});
```

### 3. 前端调用分享方法

```javascript
import { useTelegram } from './composables/useTelegram.js';

const { shareToChat } = useTelegram();

// 分享到群组
const handleShare = () => {
  shareToChat('查看这个 Mini App！', ['groups', 'channels']);
};
```

### 4. 检测来源群组

当其他人从群组中打开 Mini App 时：

```javascript
import { useTelegram } from './composables/useTelegram.js';

const { getChatInstance, initDataUnsafe } = useTelegram();

// 获取群组上下文 ID
const chatInstance = getChatInstance();

if (chatInstance) {
  console.log('从群组打开，chat_instance:', chatInstance);
  
  // 可以将这个 ID 发送到后端
  // 后端可以用它来追踪哪些群组在使用你的 Mini App
  await fetch('/api/track-usage', {
    method: 'POST',
    body: JSON.stringify({
      user_id: initDataUnsafe.value.user.id,
      chat_instance: chatInstance,
      chat_type: initDataUnsafe.value.chat_type
    })
  });
}
```

## 可用参数

从 `initDataUnsafe` 可以获取：

```javascript
{
  user: { id, first_name, username, ... },
  chat_type: 'group' | 'supergroup' | 'channel' | 'private',
  chat_instance: '1234567890',  // 群组上下文唯一标识
  start_param: 'custom_param',  // 从 direct link 传递的参数
  auth_date: 1234567890,
  hash: '...'
}
```

## 使用场景

### 场景 1：追踪 Mini App 在哪些群组中被使用

```javascript
// 后端数据库
{
  chat_instance: '1234567890',
  first_opened_by: 'user_123',
  first_opened_at: '2024-01-01',
  total_users: 15,
  last_activity: '2024-01-15'
}
```

### 场景 2：群组专属功能

```javascript
const chatInstance = getChatInstance();

if (chatInstance) {
  // 这是从群组打开的，显示协作功能
  showCollaborativeFeatures();
} else {
  // 这是私聊打开的，显示个人功能
  showPersonalFeatures();
}
```

### 场景 3：群组排行榜

```javascript
// 根据 chat_instance 统计每个群组的活跃度
const groupStats = await fetch(`/api/group-stats/${chatInstance}`);
```

## 注意事项

### ⚠️ 隐私限制

- `chat_instance` 是一个**匿名标识符**
- 你**无法**通过它获取群组名称、成员列表等信息
- 只能用来区分不同的群组上下文

### ⚠️ 需要 Inline Mode

- 必须在 BotFather 中启用 inline mode
- Bot 需要处理 `inline_query` 事件
- 需要返回合适的 inline result

### ⚠️ Direct Link 的限制

如果使用 direct link（`https://t.me/botname/appname?startapp=param`）：
- 可以通过 `start_param` 传递自定义参数
- 但**无法**在分享前知道用户要分享到哪个群组
- `chat_instance` 只在打开时才能获取

## 完整工作流程

```
1. 用户 A 在 Mini App 中点击"分享"
   ↓
2. 调用 switchInlineQuery()
   ↓
3. Telegram 显示聊天选择界面
   ↓
4. 用户 A 选择"技术交流群"
   ↓
5. Bot 收到 inline_query 事件
   ↓
6. Bot 返回 inline result（包含 Mini App 按钮）
   ↓
7. 消息发送到"技术交流群"
   ↓
8. 用户 B 在群组中点击按钮
   ↓
9. Mini App 打开，initDataUnsafe 包含：
   {
     user: { id: 'user_b_id', ... },
     chat_type: 'supergroup',
     chat_instance: 'abc123xyz'  ← 群组唯一标识
   }
   ↓
10. 后端记录：chat_instance='abc123xyz' 有新用户访问
```

## 替代方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **switchInlineQuery + chat_instance** ✅ | 官方支持、无需权限、用户体验好 | 无法获取群组详细信息 |
| 获取用户群组列表 ❌ | - | 不可行，隐私限制 |
| Direct Link + 手动参数 | 简单 | 需要用户手动选择，体验差 |
| Bot API 记录 | 可获取群组信息 | 需要 bot 被添加到群组 |

## 推荐实践

1. **使用 `switchInlineQuery` 进行分享** - 最佳用户体验
2. **用 `chat_instance` 追踪群组** - 匿名但有效
3. **后端建立映射关系** - 记录 chat_instance 与使用数据
4. **不要尝试获取群组列表** - 违反隐私政策且不可行

## 示例代码

完整的实现已经在以下文件中：

- `src/composables/useTelegram.js` - 核心功能
- `src/components/ShareButton.vue` - 分享组件
- `src/components/TelegramInfo.vue` - 信息展示

运行项目后，点击"分享到群组"按钮即可测试！
