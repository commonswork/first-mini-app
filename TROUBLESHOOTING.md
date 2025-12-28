# 故障排查指南

## 问题：点击"分享到群组"没有反应

### 可能的原因和解决方案

#### 1. Bot 未启用 Inline Mode ⭐ 最常见

**症状：**
- 点击分享按钮没有任何反应
- 控制台显示 "switchInlineQuery 方法不可用"

**解决方案：**

1. 打开 Telegram，找到 @BotFather
2. 发送命令：`/setinline`
3. 选择你的 bot
4. 输入 placeholder 文本（例如：`搜索...` 或 `分享内容`）
5. 完成后会看到确认消息

**验证：**
```
在任意聊天中输入：@your_bot_name 
如果能看到 inline 搜索界面，说明配置成功
```

#### 2. 不在 Telegram 环境中运行

**症状：**
- 在浏览器中直接打开 Mini App
- `window.Telegram.WebApp` 未定义

**解决方案：**

Mini App 必须在 Telegram 中打开，不能直接在浏览器中访问。

**正确的打开方式：**
1. 通过 Bot 的按钮打开
2. 通过 Direct Link 打开：`https://t.me/your_bot/appname`
3. 通过 Inline Button 打开

**测试方法：**
```javascript
// 在控制台检查
console.log(window.Telegram?.WebApp);
// 应该返回一个对象，而不是 undefined
```

#### 3. Telegram 版本过旧 ⭐ 你的情况

**症状：**
- 错误信息：`Method switchInlineQuery is not supported in version 6.0`
- `switchInlineQuery` 方法不存在
- Telegram WebApp 版本低于 6.7

**解决方案：**

**方案 A：更新 Telegram（推荐）**

更新到最新版本的 Telegram 即可使用完整的分享功能。

- **Android**: 在 Google Play 或官网下载最新版
- **iOS**: 在 App Store 更新
- **Desktop**: 从 [telegram.org](https://telegram.org) 下载最新版
- **Web**: 使用 [web.telegram.org](https://web.telegram.org)

**方案 B：使用备用分享方式（已实现）**

代码已经自动处理了版本兼容性：
- 版本 >= 6.7: 使用 `switchInlineQuery`（可以选择特定聊天类型）
- 版本 < 6.7: 使用 `openLink` + Telegram 分享链接（通用分享）

备用方式的限制：
- ❌ 无法限制只分享到群组
- ❌ 无法使用 inline query
- ✅ 可以分享链接到任意聊天
- ✅ 兼容所有版本

**检查版本：**
```javascript
console.log(window.Telegram.WebApp.version);
// 你的版本: 6.0
// 需要版本: 6.7+
```

#### 4. Bot 未处理 inline_query 事件

**症状：**
- 能打开聊天选择界面
- 但选择后没有结果显示

**解决方案：**

确保 Bot 后端正确处理 `inline_query` 事件：

```javascript
bot.on('inline_query', async (query) => {
  const results = [{
    type: 'article',
    id: '1',
    title: '分享 Mini App',
    description: '点击分享',
    input_message_content: {
      message_text: '快来试试这个 Mini App！'
    },
    reply_markup: {
      inline_keyboard: [[
        {
          text: '打开 Mini App',
          web_app: { url: 'YOUR_MINIAPP_URL' }
        }
      ]]
    }
  }];
  
  await bot.answerInlineQuery(query.id, results);
});
```

**验证：**
1. 启动 bot 后端
2. 在控制台查看是否收到 inline_query 事件
3. 检查是否正确返回结果

#### 5. CORS 或网络问题

**症状：**
- API 调用失败
- 控制台显示 CORS 错误

**解决方案：**

如果使用了后端 API，确保：

```javascript
// Express 示例
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

#### 6. 在开发环境中测试

**症状：**
- 本地开发时功能不正常

**解决方案：**

1. 使用 ngrok 或类似工具暴露本地服务：
```bash
ngrok http 5173
```

2. 在 @BotFather 中设置 Mini App URL 为 ngrok 提供的 HTTPS URL

3. 确保使用 HTTPS（Telegram 要求）

## 调试步骤

### 步骤 1：检查基础环境

打开浏览器控制台，运行：

```javascript
// 检查 Telegram SDK
console.log('Telegram SDK:', window.Telegram?.WebApp);

// 检查版本
console.log('Version:', window.Telegram?.WebApp?.version);

// 检查 switchInlineQuery
console.log('Has switchInlineQuery:', 
  typeof window.Telegram?.WebApp?.switchInlineQuery === 'function'
);
```

### 步骤 2：使用调试组件

1. 点击页面右下角的"显示调试信息"按钮
2. 查看各项状态是否正常
3. 点击"测试 switchInlineQuery"按钮
4. 观察是否有错误提示

### 步骤 3：检查 Bot 配置

在 Telegram 中：

1. 找到 @BotFather
2. 发送 `/mybots`
3. 选择你的 bot
4. 查看 "Bot Settings"
5. 确认 "Inline Mode" 已启用

### 步骤 4：测试 Inline Mode

在任意 Telegram 聊天中：

1. 输入 `@your_bot_name test`
2. 应该看到 inline 搜索结果
3. 如果没有结果，说明 bot 后端有问题

### 步骤 5：查看 Bot 日志

如果运行了 bot 后端：

```bash
# 查看控制台输出
# 应该看到类似这样的日志：
# 收到 inline query: { id: '...', from: '...', query: '...' }
# ✅ Inline query 处理成功
```

## 常见错误信息

### "switchInlineQuery 方法不可用"

**原因：** Bot 未启用 Inline Mode

**解决：** 在 @BotFather 中执行 `/setinline`

### "Telegram WebApp 未初始化"

**原因：** 不在 Telegram 环境中运行

**解决：** 在 Telegram 中打开 Mini App

### "分享功能不可用，请确保 Bot 已启用 Inline Mode"

**原因：** 同上

**解决：** 启用 Inline Mode

### "TypeError: Cannot read property 'switchInlineQuery' of null"

**原因：** Telegram WebApp 对象为 null

**解决：** 确保在 Telegram 中打开，并且 SDK 已加载

## 最小可行测试

创建一个最简单的测试页面：

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <button onclick="testShare()">测试分享</button>
  
  <script>
    function testShare() {
      const tg = window.Telegram.WebApp;
      
      console.log('Telegram WebApp:', tg);
      console.log('Version:', tg.version);
      console.log('Has switchInlineQuery:', 
        typeof tg.switchInlineQuery === 'function'
      );
      
      if (typeof tg.switchInlineQuery === 'function') {
        try {
          tg.switchInlineQuery('测试', ['groups']);
          console.log('调用成功！');
        } catch (error) {
          console.error('调用失败:', error);
          alert('错误: ' + error.message);
        }
      } else {
        alert('switchInlineQuery 不可用！\n请在 @BotFather 中启用 Inline Mode');
      }
    }
    
    // 初始化
    window.Telegram.WebApp.ready();
  </script>
</body>
</html>
```

## 获取帮助

如果以上方法都无法解决问题：

1. **查看完整日志**
   - 浏览器控制台
   - Bot 后端日志
   - 网络请求

2. **提供详细信息**
   - Telegram 版本
   - WebApp SDK 版本
   - 错误信息截图
   - 控制台日志

3. **参考文档**
   - [Telegram Bot API](https://core.telegram.org/bots/api)
   - [Telegram Web Apps](https://core.telegram.org/bots/webapps)
   - [Inline Mode](https://core.telegram.org/bots/inline)

## 快速检查清单

- [ ] Bot 已在 @BotFather 中启用 Inline Mode
- [ ] 在 Telegram 中打开 Mini App（不是浏览器）
- [ ] Telegram 版本 >= 6.7
- [ ] Bot 后端正在运行
- [ ] Bot 正确处理 inline_query 事件
- [ ] 使用 HTTPS（生产环境）
- [ ] 控制台没有错误信息
- [ ] 可以在聊天中使用 @bot_name 触发 inline mode

完成以上检查后，分享功能应该可以正常工作！
