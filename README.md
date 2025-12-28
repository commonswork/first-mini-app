# Telegram Mini App - 群组分享示例

这是一个展示如何在 Telegram Mini App 中实现群组分享和追踪功能的完整示例项目。

## ✨ 核心功能

- 📤 **一键分享到群组** - 使用 `switchInlineQuery` 让用户选择要分享的群组
- 🔍 **识别来源群组** - 通过 `chat_instance` 追踪 Mini App 是从哪个群组打开的
- 📊 **群组使用统计** - 记录和分析不同群组的使用情况
- 🎨 **美观的 UI** - 响应式设计，适配各种设备

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 配置 Telegram Bot

在 @BotFather 中：

1. 创建 bot 或使用现有 bot
2. 启用 Inline Mode：
   ```
   /setinline
   选择你的 bot
   输入 placeholder 文本
   ```
3. 设置 Mini App：
   ```
   /newapp
   选择你的 bot
   填写应用信息
   设置 Web App URL
   ```

### 4. 运行 Bot 后端（可选）

```bash
# 安装依赖
npm install node-telegram-bot-api

# 编辑 bot-example.js，填入你的 BOT_TOKEN
# 然后运行
node bot-example.js
```

### 5. 运行 API 后端（可选）

```bash
# 安装依赖
npm install express

# 编辑 api-example.js，填入你的 BOT_TOKEN
# 然后运行
node api-example.js
```

## 📖 工作原理

### 分享流程

```
用户点击"分享" 
  ↓
调用 switchInlineQuery()
  ↓
Telegram 显示聊天选择界面
  ↓
用户选择群组
  ↓
Bot 在群组中发送消息
  ↓
其他人点击打开
  ↓
获取 chat_instance（群组唯一标识）
```

### 关键代码

**前端分享：**
```javascript
import { useTelegram } from './composables/useTelegram.js';

const { shareToChat } = useTelegram();

// 分享到群组
shareToChat('查看这个 Mini App！', ['groups']);
```

**检测来源群组：**
```javascript
const { getChatInstance } = useTelegram();

const chatInstance = getChatInstance();
if (chatInstance) {
  console.log('从群组打开，ID:', chatInstance);
}
```

## 📁 项目结构

```
src/
├── components/
│   ├── TelegramInfo.vue      # 显示 Telegram 信息
│   ├── ShareButton.vue        # 分享按钮组件
│   └── HelloWorld.vue
├── composables/
│   └── useTelegram.js         # Telegram SDK 封装
├── utils/
│   └── urlParser.js           # URL 参数解析
├── App.vue                    # 主应用
└── main.js

bot-example.js                 # Bot 后端示例
api-example.js                 # API 后端示例
SHARE_GUIDE.md                 # 详细使用指南
```

## 🔑 核心 API

### useTelegram Composable

```javascript
const {
  tg,              // Telegram WebApp 实例
  user,            // 当前用户信息
  chat,            // 聊天信息
  initDataUnsafe,  // 初始化数据
  
  // 分享相关
  shareToChat,     // 分享到聊天
  getChatInstance, // 获取群组上下文 ID
  getStartParam,   // 获取启动参数
  
  // UI 控制
  showMainButton,
  showAlert,
  close,
  // ...
} = useTelegram();
```

## 📊 可用数据

从 `initDataUnsafe` 可以获取：

```javascript
{
  user: {
    id: 123456789,
    first_name: "张三",
    username: "zhangsan",
    language_code: "zh"
  },
  chat_type: "supergroup",      // 聊天类型
  chat_instance: "abc123xyz",   // 群组唯一标识 ⭐
  start_param: "custom_param",  // 自定义参数
  auth_date: 1234567890,
  hash: "..."
}
```

## 🎯 使用场景

1. **追踪 Mini App 在哪些群组中被使用**
   - 通过 `chat_instance` 识别不同群组
   - 统计每个群组的活跃用户数
   - 分析使用趋势

2. **群组专属功能**
   - 根据 `chat_instance` 提供不同功能
   - 实现群组协作功能
   - 创建群组排行榜

3. **病毒式传播追踪**
   - 记录分享链路
   - 分析传播效果
   - 优化分享策略

## ⚠️ 注意事项

### 隐私限制

- `chat_instance` 是**匿名标识符**
- 无法通过它获取群组名称、成员列表
- 只能用来区分不同的群组上下文

### 必需配置

- ✅ 必须在 BotFather 中启用 Inline Mode
- ✅ Bot 需要处理 `inline_query` 事件
- ✅ 需要返回包含 Mini App 按钮的 inline result

## 📚 详细文档

查看 [SHARE_GUIDE.md](./SHARE_GUIDE.md) 了解完整的实现细节和最佳实践。

## 🛠️ 技术栈

- Vue 3 + Vite
- Telegram Web Apps SDK
- Node.js + Express (后端示例)
- node-telegram-bot-api (Bot 示例)

## 📝 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
