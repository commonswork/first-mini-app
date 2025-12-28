# Telegram 版本兼容性说明

## 当前情况

你的 Telegram 版本：**6.0**  
需要的版本：**6.7+**（用于 `switchInlineQuery`）

## 功能对比

### 版本 6.7+ （推荐）

✅ **完整功能**

```javascript
// 可以选择特定的聊天类型
tg.switchInlineQuery('消息', ['groups']); // 只显示群组
tg.switchInlineQuery('消息', ['users']); // 只显示私聊
tg.switchInlineQuery('消息', ['channels']); // 只显示频道
```

**优势：**
- 精确控制分享目标
- 使用 inline query 机制
- 可以获取 `chat_instance`
- 更好的用户体验

**工作流程：**
```
点击分享 → 选择群组 → Bot 发送消息 → 其他人打开 → 获取 chat_instance
```

### 版本 6.0（你的版本）

⚠️ **备用方案**

```javascript
// 使用 Telegram 通用分享链接
const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
tg.openLink(shareUrl);
```

**限制：**
- ❌ 无法限制聊天类型（会显示所有聊天）
- ❌ 无法使用 inline query
- ❌ 无法获取 `chat_instance`
- ✅ 可以分享链接
- ✅ 兼容所有版本

**工作流程：**
```
点击分享 → 打开分享界面 → 选择聊天 → 发送链接
```

## 代码实现

项目已经自动处理了版本兼容性：

```javascript
// 自动检测版本
const supportsSwitchInlineQuery = computed(() => {
  if (!tg.value) return false;
  const version = parseFloat(tg.value.version);
  return version >= 6.7;
});

// 根据版本选择方法
if (supportsSwitchInlineQuery.value) {
  // 使用完整功能
  shareToChat('消息', ['groups']);
} else {
  // 使用备用方案
  shareFallback('消息');
}
```

## 如何更新 Telegram

### Android

1. **Google Play**
   - 打开 Google Play Store
   - 搜索 "Telegram"
   - 点击"更新"

2. **APK 直接下载**
   - 访问 https://telegram.org/android
   - 下载最新版 APK
   - 安装

### iOS

1. 打开 App Store
2. 搜索 "Telegram"
3. 点击"更新"

### Desktop

1. **Windows/Mac/Linux**
   - 访问 https://desktop.telegram.org
   - 下载对应平台的最新版
   - 安装

2. **自动更新**
   - Telegram Desktop 通常会自动提示更新
   - 点击"更新"按钮即可

### Web

使用最新的 Web 版本：
- https://web.telegram.org (WebK)
- https://web.telegram.org/a (WebA)

Web 版本始终是最新的，无需手动更新。

## 版本历史

| 版本 | 发布时间 | 主要功能 |
|------|---------|---------|
| 6.0 | 2022.04 | 基础 Mini App 支持 |
| 6.1 | 2022.04 | 支付功能 |
| 6.2 | 2022.06 | 改进的主题支持 |
| 6.4 | 2022.09 | 外部链接打开 |
| 6.7 | 2023.01 | **switchInlineQuery** ⭐ |
| 7.0 | 2023.03 | 全屏模式 |
| 8.0 | 2024.11 | 更多新功能 |

## 推荐做法

### 开发者

1. **检测版本并提供备用方案**（已实现）
   ```javascript
   if (version >= 6.7) {
     // 使用新功能
   } else {
     // 使用备用方案
   }
   ```

2. **显示版本提示**（已实现）
   - 告知用户当前版本
   - 建议更新以获得更好体验
   - 提供备用功能

3. **优雅降级**
   - 确保基本功能在所有版本都能工作
   - 新功能作为增强，而非必需

### 用户

1. **更新到最新版本**（强烈推荐）
   - 获得最佳体验
   - 支持所有新功能
   - 更好的性能和安全性

2. **使用备用方案**（临时）
   - 如果暂时无法更新
   - 基本功能仍然可用
   - 但体验会打折扣

## 功能对比表

| 功能 | 6.0 | 6.7+ |
|------|-----|------|
| 基础 Mini App | ✅ | ✅ |
| 主题支持 | ✅ | ✅ |
| 按钮控制 | ✅ | ✅ |
| 分享链接 | ✅ | ✅ |
| switchInlineQuery | ❌ | ✅ |
| 选择聊天类型 | ❌ | ✅ |
| chat_instance | ❌ | ✅ |
| 全屏模式 | ❌ | ✅ (7.0+) |

## 测试不同版本

如果你想测试不同版本的行为：

1. **使用不同设备**
   - 手机：可能是旧版本
   - 桌面：通常是新版本
   - Web：始终是最新版

2. **查看控制台**
   ```javascript
   console.log('版本:', window.Telegram.WebApp.version);
   console.log('支持 switchInlineQuery:', 
     typeof window.Telegram.WebApp.switchInlineQuery === 'function'
   );
   ```

3. **使用调试组件**
   - 点击"显示调试信息"
   - 查看版本和功能支持情况

## 常见问题

### Q: 为什么我的版本是 6.0？

A: 可能原因：
- 手机系统较旧，无法安装最新版
- 使用的是第三方 Telegram 客户端
- 长时间未更新应用

### Q: 必须更新吗？

A: 不是必须的，但强烈推荐：
- 备用方案可以工作
- 但功能和体验会受限
- 更新后可以使用完整功能

### Q: 更新后需要重新配置吗？

A: 不需要：
- 所有数据和设置都会保留
- 聊天记录不会丢失
- 直接更新即可

### Q: 如何确认更新成功？

A: 更新后：
1. 打开 Mini App
2. 查看调试信息
3. 版本应该显示 >= 6.7
4. "支持 switchInlineQuery" 应该显示 ✅

## 总结

- **当前版本 6.0**: 可以使用备用分享方案
- **更新到 6.7+**: 获得完整功能和最佳体验
- **代码已兼容**: 自动适配不同版本
- **建议更新**: 以获得最佳用户体验

更新 Telegram 后，刷新 Mini App 即可使用完整的分享功能！
