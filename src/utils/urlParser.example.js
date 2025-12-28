import { parseTelegramWebAppUrl, getTelegramUser, getTelegramTheme } from './urlParser.js';

// 使用示例

// 1. 解析完整的 URL 数据
const fullData = parseTelegramWebAppUrl();
console.log('完整数据:', fullData);

// 2. 只获取用户信息
const user = getTelegramUser();
console.log('用户信息:', user);
// 输出示例:
// {
//   id: 7522760440,
//   first_name: "Mira",
//   last_name: "",
//   username: "miragogogo",
//   language_code: "zh-hans",
//   allows_write_to_pm: true,
//   photo_url: "https://t.me/i/userpic/320/..."
// }

// 3. 获取主题参数
const theme = getTelegramTheme();
console.log('主题参数:', theme);
// 输出示例:
// {
//   accent_text_color: "#168acd",
//   bg_color: "#ffffff",
//   button_color: "#40a7e3",
//   ...
// }

// 4. 解析指定的 URL（而不是当前页面）
const customUrl = 'https://example.com/#tgWebAppData=...';
const customData = parseTelegramWebAppUrl(customUrl);
console.log('自定义 URL 数据:', customData);
